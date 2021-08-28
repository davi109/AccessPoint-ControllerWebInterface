import api from "./api";

export const TOKEN_KEY = "@controller-token-key";

export const isAuthenticate = async () => {
    try {
        const res = await api.get('verifica_login');
        if (res.data.sucesso === true) {
            return true;
        }
    } catch (error) {
        return false;
    }
}

export const isAdmin= async () => {
    try {
        const res = await api.get('verifica_login');
        if (res.data.user.user_permission === 0) {
            return true;
        }else{
            return false
        }
    } catch (error) {
        return false;
    }
}


export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const login_token = token => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const logout_token = () => {
    localStorage.removeItem(TOKEN_KEY);
};
