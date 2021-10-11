
import http from "src/http";
import {LocalStorage} from "quasar";
import ui from "src/ui";
import {api} from "boot/axios";

export async function setAuthToken(context, token) {
  context.commit('setAuthToken', token)
  http.defaults.headers.Authorization = `Bearer ${token.token}`
  LocalStorage.set('token', token)

  await loadUser(context);
}

export function setUser(context, user) {
  context.commit('setUser', user)
}

export async function loadUser(context) {
  const res = await http.get('auth/me')
  await context.dispatch('setUser', res.data.data.user);
}

export async function getToken(context, {loader}) {
  let token = context.state.authToken;

  if (!context.state.authToken) {
    token = LocalStorage.getItem('token')
    if (token) {
      loader && ui.showLoader('Logging in...')
      await setAuthToken(context, token)
      loader && ui.hideLoader()
    }
  }

  if (!token) {
    return null;
  }

/*  if (Math.floor(Date.now() / 1000) > token.expiresAt) {
    return null;
  }*/

  return token;
}

export async function logout(context) {
  context.commit('setAuthToken', null)
  context.commit('setUser', null)
  http.defaults.headers.Authorization = null
  LocalStorage.remove('token')
}

export async function getFactTypes(context) {
  if (!context.state.factTypes) {
    const res = await api.get('/fact-types')
    const data = res.data.data.types.map(v => v.name)
    context.commit('setFactTypes', data)
    return data
  }

  return context.state.factTypes
}
