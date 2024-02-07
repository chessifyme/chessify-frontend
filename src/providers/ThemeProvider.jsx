import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ThemeContext } from '../contexts/ThemeContext';
import {getUserAccountData} from '../utils/api';



const getTheme = (mode) => {
    return  mode ? "dark" : "light";
};

const ThemeProvider = ({ children }) => {
  const [ theme, setTheme ] = useState(getTheme(false));
    
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [ theme ])

  useEffect(()=>{
    getUserAccountData()
    .then((userDetaleInfo) => {
      if(userDetaleInfo){
      setTheme(getTheme(userDetaleInfo.is_dark))
      }
    })
    .catch((e) => {
      console.error('USER onModeAccount ERROR======>>>>', e);
    });
  }, [])
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default connect(null)(ThemeProvider);