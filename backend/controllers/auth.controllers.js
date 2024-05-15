const signup = async(req, res)=>{
    res.send("signup page in controller")
}

const login = async(req, res)=>{
    res.send("login page in controller")
}

const logout = async(req, res)=>{
    res.send("logout page in controller")
}




export {signup, login, logout}