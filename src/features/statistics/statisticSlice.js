import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { mockData } from "../transactionsAPI";
import _ from 'lodash';
import moment from 'moment'

const name = "statistics";
const dateFormat = 'YYYY-MM-DD';

const initialState = {
  loadState: 'idle',
  statistics: undefined
};

export const fetchStatstics = createAsyncThunk(
  `${name}/fetchStatstics`,
  async () => {
    const transactionsInStroe = JSON.parse(localStorage.getItem('fm-transactions'));
    let data;
    if (transactionsInStroe) data = transactionsInStroe;
    else data = mockData;

    // creating an array that has all the transactions in this month
    const thisMonthsDate = [
      moment().add(1, 'day').format(dateFormat),
      moment().subtract(1, 'month').format(dateFormat)
    ];
    const thisMonthsArray = _.filter(data, (obj) => { 
      if (moment(obj.date).isBetween(thisMonthsDate[1], thisMonthsDate[0])) return obj;
    }); 

    // total calculator, for every transaction done!
    const totalIncomeArr = [];
    const totalExpenceArr = [];
    data.map((val) => {
      if (val.type === 'Income') return totalIncomeArr.push(val.amount);
      else return totalExpenceArr.push(val.amount);
    })
    
    const totalIncome = totalIncomeArr.reduce(
      (previousValue, currentValue) => previousValue + currentValue, 0
    );
    const totalExpence = totalExpenceArr.reduce(
      (previousValue, currentValue) => previousValue + currentValue, 0
    );
    const total = totalIncome - totalExpence;

    // income calculator, for transactions done, this month
    const incomeArr = [];
    thisMonthsArray.map((val) => {
      if (val.type === 'Income') return incomeArr.push(val.amount);

      return null;
    })
    const income = incomeArr.reduce(
      (previousValue, currentValue) => previousValue + currentValue, 0
    );

    // expense calculator, for transactions done, this month
    const expenseArr = [];
    thisMonthsArray.map((val) => {
      if (val.type === 'Expense') return expenseArr.push(val.amount);

      return null;
    });
    const expense = expenseArr.reduce(
      (previousValue, currentValue) => previousValue + currentValue, 0
    );

    const body = {
      total,
      income,
      expense,
    }

    return body;
  }
);

const statisticSlice = createSlice({
  name,
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchStatstics.pending, (state) => {
      state.loadState = 'pending';
    });
    builder.addCase(fetchStatstics.fulfilled, (state, action) => {
      state.loadState = 'loaded';
      state.statistics = action.payload;
    });
    builder.addCase(fetchStatstics.rejected, (state) => {
      state.loadState = 'failed';
    });
  },
});

export default statisticSlice.reducer;
