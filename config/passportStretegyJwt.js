const { Strategy, ExtractJwt } = require('passport-jwt')
const passport = require('passport')

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_KEY,
};

passport.use(
    new Strategy(opts, async(jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload._id);
            if(user){
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        } catch (error) {
            console.log(error);
        }
    })
)

module.exports = passport;