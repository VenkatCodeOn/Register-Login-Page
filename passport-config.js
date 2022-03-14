const  LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')
const mongodb=require('mongodb')
const MongoClient=mongodb.MongoClient;

function initialize(passport,getUserByEmail,getUserById){
    const authenticateUSer=async(email,password,done)=>{
        const user= getUserByEmail(email)
        if(user==null){
            return done(null,false,{message:"Invalid User"})
        }
        try{
            if(await bcrypt.compare(password,user.password)){
                return done(null,user)
            }
            else{
                return done(null,false,{message: "Password Incorrect"})
            }
        }
        catch(e){
            return done(e)

        }
    }
    passport.use(new LocalStrategy({usernameField:'email'},authenticateUSer))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser((id,done)=>{
        return done(null,getUserById(id))
     })

}
module.exports=initialize