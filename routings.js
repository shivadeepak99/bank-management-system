const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const {deactivateaccount,viewtrans,getdeactivator,getapproveregectacc,
    viewactiveloans,
    approveorreject,
    toreverseviewtrans,
    reversetransaction,
    reviewloanaiations,
    apprejloans,
    viewusers,
    getapplyLoan,
    applyLoan,
    validatepass,
    deposit,admlogout,
    with_draw,
    _get_bal,
    post_acc_app_form,
    get_acc_app_form,
    gettransaction_history,
    adminpost,
    admget,help,
    getdashboard,
    updpass,
    profileget,
    profilepost,
    recoverypost,
    registerget,
    baseget,
    loginget,
    loginpost,
    logoutget,
    registerpost,
    recoveryget,
    getpendloans} = require('./handler');

dotenv.config();
const router = express.Router();
const raw = path.join(__dirname);

router.use(express.static(raw));
router.use(cookieParser());
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

router.get('/', baseget);
router.get('/login', loginget);
router.post('/login', loginpost);
router.get('/logout', logoutget);

router.get('/register', registerget);
router.post('/register', registerpost);
router.get('/recovery', recoveryget);
router.post('/recovery', recoverypost);
router.get('/profile', profileget);
router.post('/profile', profilepost);
router.post('/update-password', updpass);
router.get('/dashboard', getdashboard);
router.get('/admlog', admget);
router.post('/admin-dashboard', adminpost);
router.get('/trans_history', gettransaction_history);
router.get('/acc_o_o', get_acc_app_form);
router.post('/acc_o_o', post_acc_app_form);
router.post('/get_bal', _get_bal);
router.post('/with_draw', with_draw);
router.post('/deposit', deposit);
router.post('/validatepass', validatepass);
router.get('/applyloan', getapplyLoan);
router.post('/apply-loan', applyLoan);
router.get('/viewusers', viewusers);
router.get('/viewloans', reviewloanaiations)
router.get('/viewactiveloans', viewactiveloans);
router.get('/approveorreject', getapproveregectacc);
router.get('/reverse-transaction', reversetransaction);
router.get('/review-loan-extensions', reviewloanaiations);
router.post('/approve-loans', apprejloans);
router.get('/approve-loans', getpendloans);
router.post('/approveaccounts',approveorreject );
router.get('/deactivateaccount', getdeactivator);
router.post('/deactivateaccount',deactivateaccount );
router.get('/viewtrans', viewtrans);
router.get('/help', help);
router.get('/toreverseviewtrans', toreverseviewtrans);
router.post('/reversetrans',reversetransaction );

router.get('/admlogout', admlogout);
module.exports = router;
