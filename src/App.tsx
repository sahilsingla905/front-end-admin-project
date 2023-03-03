import React from 'react';
import logo from './logo.svg';
import './App.css';
import ListItem from './components/list/ListItem';
import List from './components/list/List';
import AppTable from './components/table/Table';
import Main from './Main';

function App() {

  function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number,
  ) {
    return { name, calories, fat, carbs, protein };
  }
  
  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const columns = {
    name: 'Name',
    calories: 'Cal',
    fat: 'Fat',
    carbs: 'Carbs',
    protein: 'Proteins'
  };

  return (
    // <div className="App">
    //   <header className="App-header">
    //     <List>
    //       <ListItem title="List header">
    //         <AppTable rows={rows} columns={columns}/>
    //       </ListItem>
    //     </List>
    //   </header>
    // </div>
    <Main/>
  );
}

export default App;
