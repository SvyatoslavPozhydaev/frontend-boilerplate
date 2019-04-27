import './404';
import initHome from './home';
// import initExample from './example'; // need remove;

export default () => {
  console.log('init pages');
  initHome();
  // initExample();
};
