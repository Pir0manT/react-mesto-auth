import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import Main from './Main'
import ImagePopup from './ImagePopup'
import { CurrentUserContext } from '../contexts/CurrentUserContext'
import api from '../utils/api'
import spinner from '../images/Spinner.svg'
import EditProfilePopup from './EditProfilePopup'
import EditAvatarPopup from './EditAvatarPopup'
import ConfirmDeletePopup from './ConfirmDeletePopup'
import AddPlacePopup from './AddPlacePopup'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/auth.hook'
import resolve from '../images/resolve.svg'
import reject from '../images/reject.svg'
import InfoTooltip from './InfoTooltip'

function App() {
  const [isEditProfilePopupOpen, setOpenEditProfile] = useState(false)
  const [isEditAvatarPopupOpen, setOpenEditAvatar] = useState(false)
  const [isAddPlacePopupOpen, setOpenAddPlace] = useState(false)
  const [isConfirmDeletePopupOpen, setOpenConfirmDelete] = useState(false)
  const [isInfoTooltipOpen, setOpenInfoTooltip] = useState(false)
  const [selectedCard, setSelectedCard] = useState({})
  const [isImageOpen, setImageOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    name: 'Загрузка...',
    about: 'Загрузка...',
    avatar: spinner,
    id: '',
  })
  const [cards, setCards] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [loadingText, setLoadingText] = useState('Сохранение...')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [emailName, setEmailName] = useState(null)
  const [popupImage, setPopupImage] = useState('')
  const [popupTitle, setPopupTitle] = useState('')
  const navigate = useNavigate()

  const { loginUser, registerUser, getToken, error, clearError } = useAuth()

  function onRegister(email, password) {
    registerUser(email, password)
      .then(() => {
        setPopupImage(resolve)
        setPopupTitle('Вы успешно зарегистрировались!')
        navigate('/sign-in')
      })
      .catch(() => {
        setPopupImage(reject)
        setPopupTitle('Что-то пошло не так! Попробуйте ещё раз.')
        console.error(error)
        clearError()
      })
      .finally(handleInfoTooltip)
  }

  function onLogin(email, password) {
    loginUser(email, password)
      .then((res) => {
        localStorage.setItem('jwt', res.token)
        setIsLoggedIn(true)
        setEmailName(email)
        navigate('/')
      })
      .catch(() => {
        setPopupImage(reject)
        setPopupTitle('Что-то пошло не так! Попробуйте ещё раз.')
        console.error(error)
        clearError()
        handleInfoTooltip()
      })
  }

  function onSignOut() {
    setIsLoggedIn(false)
    setEmailName(null)
    navigate('/sign-in')
    localStorage.removeItem('jwt')
  }

  useEffect(() => {
    const jwt = localStorage.getItem('jwt')
    if (jwt) {
      getToken(jwt)
        .then((res) => {
          if (res) {
            setIsLoggedIn(true)
            setEmailName(res.data.email)
          }
        })
        .catch(() => {
          console.error(error)
          clearError()
        })
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn === true) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    Promise.all([api.getProfile(), api.getInitialCards()])
      .then(([userProfile, cards]) => {
        setCurrentUser(userProfile)
        setCards(cards)
      })
      .catch((error) => console.log(error))
  }, [])

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setImageOpen(true)
  }

  const handleCardLike = (card) => {
    const cardIsLiked = card.likes.some((like) => like._id === currentUser._id)
    api
      .changeLike(card._id, cardIsLiked)
      .then((newCard) =>
        setCards((state) =>
          state.map((item) => (item._id === card._id ? newCard : item))
        )
      )
      .catch((error) => console.log(error))
  }

  const handleCardDelete = () => {
    setLoadingText('Удаление...')
    setIsSaving(true)
    api
      .delCard(selectedCard._id)
      .then(() => {
        setCards((state) =>
          state.filter((card) => card._id !== selectedCard._id)
        )
        setSelectedCard({})
        closeAllPopups()
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSaving(false))
  }

  const handleUpdateUser = (newUser) => {
    setLoadingText('Сохранение профиля...')
    setIsSaving(true)
    api
      .setProfile(newUser)
      .then((user) => {
        setCurrentUser(user)
        closeAllPopups()
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSaving(false))
  }

  const handleUpdateAvatar = (avatar) => {
    setLoadingText('Сохранение аватара...')
    setIsSaving(true)
    api
      .setAvatar(avatar)
      .then((userInfo) => {
        setCurrentUser(userInfo)
        closeAllPopups()
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSaving(false))
  }

  const handleAddPlace = (card) => {
    setLoadingText('Добавление места...')
    setIsSaving(true)
    api
      .addCard(card)
      .then((newCard) => {
        setCards((state) => [newCard, ...state])
        closeAllPopups()
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSaving(false))
  }

  const handleAddPlaceClick = () => {
    setOpenAddPlace(true)
  }

  const handleEditAvatarClick = () => {
    setOpenEditAvatar(true)
  }

  const handleEditProfileClick = () => {
    setOpenEditProfile(true)
  }

  const handleDeleteClick = (card) => {
    setSelectedCard(card)
    setOpenConfirmDelete(true)
  }

  const handleInfoTooltip = () => {
    setOpenInfoTooltip(true)
  }

  const closeAllPopups = () => {
    isImageOpen && setImageOpen(false)
    isAddPlacePopupOpen && setOpenAddPlace(false)
    isEditAvatarPopupOpen && setOpenEditAvatar(false)
    isEditProfilePopupOpen && setOpenEditProfile(false)
    isConfirmDeletePopupOpen && setOpenConfirmDelete(false)
    isInfoTooltipOpen && setOpenInfoTooltip(false)
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header />
        <Main
          onEditAvatar={handleEditAvatarClick}
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onCardClick={handleCardClick}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleDeleteClick}
        />
        <Footer />

        <ConfirmDeletePopup
          isOpen={isConfirmDeletePopupOpen}
          isSaving={isSaving}
          loadingText={loadingText}
          onClose={closeAllPopups}
          onDeleteCard={handleCardDelete}
        />

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          isSaving={isSaving}
          loadingText={loadingText}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          isSaving={isSaving}
          loadingText={loadingText}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          isSaving={isSaving}
          loadingText={loadingText}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlace}
        />

        <ImagePopup
          name="open-image"
          isOpen={isImageOpen}
          card={selectedCard}
          onClose={closeAllPopups}
        />

        <InfoTooltip
          image={popupImage}
          title={popupTitle}
          isOpen={isInfoTooltipOpen}
          onClose={closeAllPopups}
        />
      </div>
    </CurrentUserContext.Provider>
  )
}

export default App
