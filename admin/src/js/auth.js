import {store} from '../store'

async function AuthGuard(to, from, next) {
  let isAuthenticated = false;

  const token = await store.dispatch('app/getToken', {loader: true})
  isAuthenticated = !!token;

  if(isAuthenticated) {
    next();
  } else {
    next('/login?next=' + to.fullPath);
  }
}


export default AuthGuard
