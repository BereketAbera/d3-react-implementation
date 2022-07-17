import { useState } from 'react';
import './App.css';
import SideBar from './components/SideBar';
// import BarChart from './components/BarChart'
// import ScatterPlot from './components/ScatterPlot'
// import LineChart from './components/LineChart'
// import HierarchicalEdge from './components/HierarchicalEdge';
import StackedBarChart from './components/StackedBarChart';
// import Home from './pages/Home'
// import Slack from './pages/Slack'

function App() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    <div className="flex relative">
      <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
      <div className={`flex w-full px-2 ${sideBarOpen ? 'pl-56' : 'pl-20'}`}>
        <StackedBarChart />
      </div>
    </div>
  );
}

export default App;
