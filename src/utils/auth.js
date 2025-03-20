// 用户信息管理
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

export const setUserInfo = (info) => {
  localStorage.setItem('userInfo', JSON.stringify(info))
}

export const removeUserInfo = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}

// 检查是否登录
export const isLoggedIn = () => {
  return !!localStorage.getItem('token')
} 