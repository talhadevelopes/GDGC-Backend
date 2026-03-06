import User from '../models/User.js'
const AdminMiddleware = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.id)
        console.log(user)
        if (!user.admin || !user.superadmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            message : error.message
        })
    }


}
export default AdminMiddleware;