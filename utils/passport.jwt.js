var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const { Admin, Personel } = require("../model/index");
const passport = require("passport");
const roles = require("../config/authorize.roles.config");

var opts = {};
const cookieExtractor = (req) => {
  let jwt = null;
  if (req && req?.headers?.authorization) {
    jwt = req?.headers?.authorization.split(" ")[1];
    return jwt;
  }
  // if (req && req.cookies) {
  //   jwt = req.cookies["jwt"];
  // }

};
opts.jwtFromRequest = cookieExtractor;
// ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.ACCESS_TOKEN_SECRET;

passport.use(
  "jwt",
  new JwtStrategy(opts, function (payload, done) {
    const role = payload?.role;
    const roleModel = (roles, r) => {
      const foundRole = (r) => roles.find((role) => role === r);
      if (foundRole(r) === "Admin") {
        return Admin;
      } else if (foundRole(r) === "Personel") {
        return Personel;
      } else {
        return false;
      }
    };

    if (roleModel(roles, role)) {
      roleModel(roles, role)
        ?.findOne({ gmail: payload.gmail }, function (err, user) {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .select(["gmail", "_id", "admin", "role"]);
    } else {
      console.log("no role found");
      done(null, false); // no role found.
    }
  })
);