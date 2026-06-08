/**
 * File:apps.js
 * Author: Nathan PRIGENT (3199547), Kilian Meddas (3198575)
 * Nathan did almost everything, kilian just added the group in the request
 * */

const express = require('express')
const { getDB } = require('../db/Connection')
const { ObjectId } = require('mongodb')
const auth = require('../middleware/Auth')

const router = express.Router()

// Collect all decisions made by the user group
router.get('/', auth, async (req, res, next) => {
  try {
    const db = getDB()
    const userEmail = req.user

    // Retrieve the user's group
    const user = await db.collection('Roommates').findOne({ _id: userEmail })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Find votes belonging to this group only
    const votes = await db
      .collection('DecisionMaking')
      .find({ _GroupId: user._GroupId })
      .toArray()

    // Add a "currentUserHasVoted" flag to assist the frontend
    const votesWithStatus = await Promise.all(
      votes.map(async (v) => {
        const creatorUser = await db
          .collection('Roommates')
          .findOne({ _id: v.createdby })
        return {
          ...v,
          currentUserHasVoted: v.votes_details?.some(
            (vd) => vd.user === userEmail,
          ),
          creator: v.createdby === userEmail,
          creatorName: creatorUser?.firstName || v.createdby,
        }
      }),
    )
    res.json(votesWithStatus)
  } catch (err) {
    next(err)
  }
})

// 2. Vote for an option
router.post('/vote', auth, async (req, res, next) => {
  const { voteId, optionIndex } = req.body
  const userEmail = req.user

  try {
    const db = getDB()
    const votesColl = db.collection('DecisionMaking')

    if (!ObjectId.isValid(voteId)) {
      return res.status(400).json({ message: 'Invalid voteId' })
    }

    const vote = await votesColl.findOne({ _id: new ObjectId(voteId) })
    if (!vote) return res.status(404).json({ message: 'Vote not found' })
    const existingVote = vote.votes_details?.find((v) => v.user === userEmail)

    // Vote
    if (!existingVote) {
      await votesColl.updateOne(
        { _id: vote._id },
        {
          $inc: { [`options.${optionIndex}.votes`]: 1 },
          $push: { votes_details: { user: userEmail, optionIndex } },
        },
      )
    }

    // Cancel the vote
    else if (existingVote.optionIndex === optionIndex) {
      await votesColl.updateOne(
        { _id: vote._id },
        {
          $inc: { [`options.${optionIndex}.votes`]: -1 },
          $pull: { votes_details: { user: userEmail } },
        },
      )
    }

    // Change the vote for another option
    else {
      await votesColl.updateOne(
        { _id: vote._id },
        {
          $inc: {
            [`options.${existingVote.optionIndex}.votes`]: -1,
            [`options.${optionIndex}.votes`]: 1,
          },
          $set: {
            'votes_details.$[elem].optionIndex': optionIndex,
          },
        },
        {
          arrayFilters: [{ 'elem.user': userEmail }],
        },
      )
    }
    res.json({ message: 'Vote updated' })
  } catch (err) {
    next(err)
  }
})

// 3. Create a new vote (linked to the group)
router.post('/create', auth, async (req, res, next) => {
  const { question } = req.body
  const userEmail = req.user

  try {
    const db = getDB()
    const user = await db.collection('Roommates').findOne({ _id: userEmail })
    const group_members = await db
      .collection('Roommates')
      .find({ _GroupId: user._GroupId })
      .toArray()

    const newVote = {
      question,
      createdby: userEmail,
      _GroupId: user._GroupId, // Link the vote to the creator's group
      options: group_members.map((m) => ({
        text: m.firstName,
        votes: 0,
      })),
      voters: [], // track who voted
      votes_details: [], // to be able to change the vote after
      createdAt: new Date(),
    }

    const result = await db.collection('DecisionMaking').insertOne(newVote)
    res.json(result.insertedId)
  } catch (err) {
    next(err)
  }
})

// Delete a vote
router.delete('/:_id', auth, async (req, res, next) => {
  try {
    const db = getDB()
    const voteId = req.params._id
    const userEmail = req.user

    if (!ObjectId.isValid(voteId)) {
      return res.status(400).json({ message: 'Invalid voteId' })
    }

    // If the vote doesn't exist
    const vote = await db
      .collection('DecisionMaking')
      .findOne({ _id: new ObjectId(voteId) })
    if (!vote) {
      return res.status(404).json({ message: 'Vote notfound' })
    }

    // Only the creator can delete the vote
    if (vote.createdby !== userEmail) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await db
      .collection('DecisionMaking')
      .deleteOne({ _id: new ObjectId(voteId) })
    res.json({ message: 'Vote deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
