import api from './axiosConfig';
import { userMePath, userMePasswordPath } from '../config/apiPaths';

const PROFILE_PATH_KEY = 'xvaudio_profile_api_path';

function setResolvedProfilePath(path) {
  if (path) sessionStorage.setItem(PROFILE_PATH_KEY, path);
}

/** Ruta usada en el último GET de perfil exitoso, o la de configuración. */
export function resolvedProfilePath() {
  return sessionStorage.getItem(PROFILE_PATH_KEY) || userMePath();
}

/**
 * GET perfil: VITE_API_USER_ME, luego /user/me y /auth/me si hay 404.
 */
export async function fetchUserMe() {
  const primary = userMePath();
  const tries = [primary];
  if (primary === '/users/me') {
    tries.push('/user/me', '/auth/me');
  }

  let lastErr;
  for (const path of tries) {
    try {
      const res = await api.get(path);
      setResolvedProfilePath(path);
      return res;
    } catch (e) {
      lastErr = e;
      if (e.response?.status !== 404) throw e;
    }
  }
  sessionStorage.removeItem(PROFILE_PATH_KEY);
  throw lastErr;
}

export function patchUserMe(body) {
  return api.patch(resolvedProfilePath(), body);
}

export function patchUserPassword(body) {
  const base = resolvedProfilePath();
  return api.patch(`${base}/password`, body).catch((err) => {
    if (err.response?.status === 404) {
      return api.patch(userMePasswordPath(), body);
    }
    throw err;
  });
}
