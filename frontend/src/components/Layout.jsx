import React from 'react'
import Navbar from './Navbar'
import styles from '../styles/Layout.module.css'

const Layout = ({ children }) => {
  return (
    <div className={styles.mainLayout}>
      <Navbar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}

export default Layout 