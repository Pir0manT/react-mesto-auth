import React from 'react'
import logo from '../images/logo.svg'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <img
        className="header__logo link-opacity"
        src={logo}
        alt="логотип Место"
      />
      <nav className="header__auth">
        <p className="header__text">andy@top61.ru</p>
        <Link
          to="/"
          className="header__link link-opacity"
          type="button"
          onClick={() => {}}
        >
          Выйти
        </Link>
      </nav>
    </header>
  )
}

export default Header
