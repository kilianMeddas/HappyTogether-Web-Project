import PropTypes from 'prop-types'

import './css/Loading.css'

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="loadingPage">
      <div className="cometSpinner">
        <span className="cometDot"></span>
      </div>

      <p>{text}</p>
    </div>
  )
}

Loading.propTypes = {
  text: PropTypes.string,
}

export default Loading
