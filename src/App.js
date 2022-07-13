import { useState } from 'react';
import './App.css';
import SideBar from './components/SideBar';
// import BarChart from './components/BarChart'
// import ScatterPlot from './components/ScatterPlot'
// import LineChart from './components/LineChart'
import HierarchicalEdge from './components/HierarchicalEdge';
// import Home from './pages/Home'
// import Slack from './pages/Slack'

function App() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    <div className="flex relative">
      <SideBar
        className="p-2 absolute"
        sideBarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpen}
      />
      <div
        // style={{ transition: 'all .5s' }}
        className={`flex w-full px-2 ${sideBarOpen ? 'pl-56' : 'pl-20'}`}
      >
        <HierarchicalEdge />
      </div>
    </div>
  );
}

export default App;
