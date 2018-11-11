import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    return (
      <div className="test-react">test React</div>
    );
  }
}

export default () => {
  ReactDOM.render(<App />, document.getElementById('test-react'));
};
