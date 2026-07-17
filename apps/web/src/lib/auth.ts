// Dummy auth store for Hackathon basic auth
export const auth = {
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },
  getToken: () => {
    return localStorage.getItem('access_token');
  },
  removeToken: () => {
    localStorage.removeItem('access_token');
  },
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
