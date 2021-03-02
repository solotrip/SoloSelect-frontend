import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from "react-router-dom";
import styles from './styles.module.scss'


const Layout = ({children}) => {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <NavLink to='/'>SoloSelect</NavLink>
        <NavLink to='/area'>Areas</NavLink>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout;
