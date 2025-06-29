import { Provider } from 'react-redux';

import Body from "./components/layout/Body";
import appStore from './store/appStore';

function App() {
  return (
    <div>
      <Provider store={appStore}>
          <Body/>
      </Provider>
    
    </div>
  );
}

export default App;
