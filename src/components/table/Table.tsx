import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

type ChildProps = {
  rows: Array<any>,
  columns: Record<string, string>,
};

const AppTable = ({rows, columns}: ChildProps) => {
  return (
    <TableContainer component={Paper} className="!shadow-none">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {Object.keys(columns).map((title) => {
              return <TableCell key={title}>{columns[title]}</TableCell>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.map((row, idx) => (
            <TableRow
              key={'row' + idx}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              className="odd:bg-[#F1FAFE]"
            >
              {
                Object.keys(columns).map((column) => {
                  return (
                    <TableCell key={'row' + idx + column}>{row[column]}</TableCell>
                  )
                })
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AppTable;