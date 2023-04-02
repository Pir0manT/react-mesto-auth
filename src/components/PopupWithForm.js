import React, { useEffect, useRef } from 'react'

function PopupWithForm({
  name,
  isOpen,
  title,
  btnTitle,
  isSaving,
  loadingText,
  children,
  onClose,
  onSubmit,
  isConfirmPopup,
}) {
  const submitBtnRef = useRef()

  useEffect(() => {
    submitBtnRef.current.textContent = isSaving ? loadingText : btnTitle
  }, [isSaving, loadingText])

  return (
    <div className={`popup popup_type_${name} ${isOpen && 'popup_opened'}`}>
      <div
        className={`popup__${
          !isConfirmPopup ? 'container' : 'container-delete'
        }`}
      >
        <h2 className="popup__title">{title}</h2>
        <form name={name} onSubmit={onSubmit} className="popup__form">
          {children}
          <button ref={submitBtnRef} className="popup__save" type="submit">
            {btnTitle}
          </button>
        </form>
        <button
          className="popup__close link-opacity"
          type="button"
          aria-label="закрыть"
          onClick={onClose}
        />
      </div>
    </div>
  )
}

export default PopupWithForm
