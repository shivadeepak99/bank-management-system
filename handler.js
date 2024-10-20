const path = require('path');
const con = require('./dbcon/db');
const bcrypt = require('bcrypt');
const raw = path.join(__dirname);
const baseget = (req, res) => {
    if (!req.session.customer_id) {
        console.log("not logged in ", req.session.customer_id);
        return res.redirect('/dashboard');
    }

    console.log('yeah logged in already');

    const isNewUser = req.session.newUser;
    req.session.newUser = false;

    // Query to get the account number where status is 'approved'
    con.query('SELECT Account_no FROM account WHERE customer_id = ? and status=?', [req.session.customer_id, 'approved'], (err, accounts) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).render('errorinsbal', { errork: 'Internal Server Error' });
        }

        // Check if the user has approved accounts
        if (accounts.length > 0) {console.log("this is in if accounts 😘",accounts)
            return res.render('dashboard', {
                Naam: req.session.customerName,
                cid: req.session.customer_id,
                isNewUser: isNewUser,
                accounts: accounts
            });
        } else {                console.log("this is in else  accounts 😘",accounts)

            return res.render('veryfirstdashboardafterlogin', {
                Naam: req.session.customerName,
                cid: req.session.customer_id,
                isNewUser: isNewUser,
            });
        }
    });
};


const getdashboard=(req,res)=>{
    return res.sendFile(raw+'/dashboard.html');
}

const loginget= (req, res) => {
    res.sendFile(path.join(raw, '/login.html'));
};

const loginpost = (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render(`errorinsbal`,{errork:'email ID and password are required.'})

    }

    const loginQuery = 'SELECT * FROM customer WHERE email = ?';

    con.query(loginQuery, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).render(`errorinsbal`,{errork:'Database error occurred.'})

        }

        if (results.length === 0) {
            return res.status(404).render(`errorinsbal`,{errork:'Customer not found. Invalid account details.'})

        }

        const customer = results[0];
console.log(customer)
        if (!customer.password) {
            console.error("Customer password not found in database.");
            return res.status(500).render(`errorinsbal`,{errork:'Customer password not found.'})

        }

        console.log("Customer password (hashed):", customer.password);
        console.log("Entered password (plain):", password);

        if (bcrypt.compareSync(password, customer.password)) {
            req.session.customer_id=customer.customer_id
            req.session.email = email;

            req.session.customerName = customer.name;
            req.session.phone = customer.phone_number;
            console.log("Customer with email :", email, "logged in successfully!");
            return res.redirect('/');
        } else {
            return res.status(401).render(`errorinsbal`,{errork:'Incorrect password. Please try again.'})

        }
    });
};



const logoutget=(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).render(`errorinsbal`,{errork:"Cannot log out. Please try again!"})

        }
        console.log("customer logged out");
        res.redirect('./dashboard.html');
    });
};


const registerpost = (req, res) => {
    const {phoneNumberRegister, Name, email, dateofbirth, address, city, state, pincode, registerPassword} = req.body;

    const hashedPassword = bcrypt.hashSync(registerPassword, 10);

    var Customer_ID = rancusid();
    console.log(Customer_ID);

    const addQuery = `INSERT INTO customer 
        (customer_id, phone_number, name, Email, dateofbirth, address, city, state, pincode, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    con.query(addQuery, [Customer_ID, phoneNumberRegister, Name, email, dateofbirth, address, city, state, pincode, hashedPassword], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).render(`errorinsbal`,{errork:'Unexpected error occurred.'})

        }
        console.log(result);


        req.session.isNewUser = true;
        req.session.customerName = Name;

        res.render('veryfirstdashboardafterlogin.ejs', {
            cid: Customer_ID,
            Naam: req.session.customerName,
            isNewUser: req.session.isNewUser
        });
    });
}


const registerget=(req,res)=>{
    res.sendFile(raw+"/register.html")
}
const recoveryget = (req, res) => {

    res.render('recovery');
};


const recoverypost = (req, res) => {
    const { Cid, Name, Phone } = req.body;
    console.log('Received for recovery:', { Cid, Name, Phone });

    let q = 'SELECT c.Name, c.phone_number,c.password FROM customer c WHERE c.Customer_ID = ?';

    con.query(q, [Cid], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).render(`errorinsbal`,{errork:'Internal server error'})

        }

        if (results.length === 0) {
            console.log('No customer found with provided Customer_ID.');
            return res.status(500).render(`errorinsbal`,{errork:'Customer not found.'})

        }

        console.log('Query results:', results);

        const customer = results[0];
        if (customer.Name === Name && customer.phone_number === Phone) {
           req.session.customerID=Cid;
            console.log('Customer details verified successfully.');
            return res.status(200).render('passupdate', {message:'Verification successful. Proceed with password recovery.'} );
        } else {
            console.log('Name or phone number does not match.');
            return res.status(500).render(`errorinsbal`,{errork:'Name or phone number does not match.'})

        }
    });
};

const profileget = (req, res) => {

console.log(req.session.email)
    const query = 'SELECT customer_id, phone_number, name, dateofbirth, address, city, state, pincode FROM customer WHERE Email = ?';

    con.query(query, [req.session.email], (error, results) => {
        if (error) {
            return res.status(500).render(`errorinsbal`,{errork:'Error fetching data from the database'})

        }
console.log(results)
        if (results.length > 0) {
            const customerData = results[0];
            res.status(200).render('profile', {
                pname: customerData.name,
                pemail: req.session.email,
                pphno: customerData.phone_number,
                padr: customerData.address,
                pdob: customerData.dateofbirth.toString().slice(0,10)
,
                pcity: customerData.city,
                pstate: customerData.state,
                pincode: customerData.pincode,
                customerId: customerData.customer_id
            });
        } else {
            return res.status(404).render(`errorinsbal`,{errork:'Customer not found'})

        }
    });
};




const profilepost = (req, res) => {
    console.log(req.body);
    const { password, name, phone, address, dob, city, state, pincode } = req.body;
    const loginQuery = 'SELECT * FROM customer WHERE customer_id = ?';

    con.query(loginQuery, [req.session.customer_id], (err, results) => {
        if (err) {
            return res.status(500).render(`errorinsbal`,{errork:'Database error occurred.'})

        }

        if (results.length === 0) {
            return res.status(404).render(`errorinsbal`,{errork:'Customer not found. Invalid account details.'})

        }

        const customer = results[0];

        if (bcrypt.compareSync(password, customer.password)) {
            const updateFields = [];
            const updateValues = [];

            if (name) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }
            if (phone) {
                updateFields.push('phone_number = ?');
                updateValues.push(phone);
            }
            if (address) {
                updateFields.push('address = ?');
                updateValues.push(address);
            }
            if (dob) {
                updateFields.push('dateofbirth = ?');
                updateValues.push(dob);
            }
            if (city) {
                updateFields.push('city = ?');
                updateValues.push(city);
            }
            if (state) {
                updateFields.push('state = ?');
                updateValues.push(state);
            }
            if (pincode) {
                updateFields.push('pincode = ?');
                updateValues.push(pincode);
            }

            if (updateFields.length === 0) {
                return res.status(400).render(`errorinsbal`,{errork:'No fields to update.'})

            }

            updateValues.push(req.session.customer_id);

            const updateQuery = `
                UPDATE customer 
                SET ${updateFields.join(', ')} 
                WHERE customer_id = ?`;

            con.query(updateQuery, updateValues, (err, updateResult) => {
                console.log(err)
                if (err) {
                    return res.status(500).send('Failed to update customer details.')

                }

                return res.status(200).send('Customer updated successfully')

            });
        } else {
            return res.status(400).send('Incorrect password. Please try again.')

        }
    });
};



const updpass = (req, res) => {
    const { newpaass, renewpass } = req.body;

    console.log("Request body in updpass:", req.body);

    if (!newpaass || !  renewpass) {
        return res.status(400).send("Both password fields are required.");
    }

    if (newpaass !== renewpass) {
        return res.status(400).send("Passwords do not match.");
    }

    const hashedPassword = bcrypt.hashSync(newpaass, 10);
    const rlist = [hashedPassword, req.session.customerID];

    const updatepass = `
        UPDATE customer 
        SET password=? 
        WHERE Customer_ID = ?
    `;

    con.query(updatepass, rlist, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed! Cannot update password at the moment. Please try again.");
        }

        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error logging out after password update.");
            }

            res.send(`
                <html>
                    <style>
                        body { background: linear-gradient(45deg, blue, black); }
                    </style>
                    <script> alert('Password updated successfully! Please re-login.');</script>
                    <meta http-equiv="refresh" content="2; url='./login' ">
                    <h1 style="color: yellow; text-align: left; font-weight: bolder; font-size: xxx-large">Redirecting...</h1>
                </html>
            `);
        });
    });
};
const admget=(req,res)=>{
    return res.status(200).sendFile(raw +"/adminlogin.html")
}
const adminpost= async (req, res) => {
    const { admin_username, admin_password } = req.body;
    /*
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    console.log(hashedPassword)
    con.query('INSERT INTO admin (username, password) VALUES (?, ?)', [admin_username, hashedPassword],(err,result)=>{
        console.log(err)
    });
*/
    con.query('SELECT * FROM admin WHERE username = ?', [admin_username], (err, results) => {
        if (err) return res.status(500).render(`errorinsbal`,{errork:'Database error'})



        if (results.length === 0) {
            return res.status(401).render(`errorinsbal`,{errork:'Invalid username or password'})

        }

        const user = results[0];


        bcrypt.compare(admin_password, user.password, (err, isMatch) => {
            if (err)  return res.status(500).render(`errorinsbal`,{errork:'Error comparing passwords'})


            if (!isMatch)  return res.status(401).render(`errorinsbal`,{errork:'Invalid username or password'})


            req.session.userId = user.id;
            console.log("attempted to access dashboard")
            res.render('admindash')
        });
    });
}

const gettransaction_history = (req, res) => {
    const tran = `SELECT * FROM transactions WHERE customer_id = ?`;

    con.query(tran, [req.session.customer_id], (err, results) => {
        if (err) {
            console.log(err)
            console.log("Cannot fetch transaction query");
            return res.status(500).send("Database error!!");
        }
console.log(results)
        res.render('transactions', { transactions: results });
    });
};

const validatepass = (req, res) => {
    const { password } = req.body;

    const customerId = req.session.customer_id;

    if (!customerId) {
        return res.status(400).send('Session expired or invalid session. Please log in again.');
    }

    const loginQuery = 'SELECT password FROM customer WHERE customer_id = ?';

    con.query(loginQuery, [customerId], (err, results) => {
        if (err) {
            return res.status(500).send('Database error occurred.');
        }

        if (results.length === 0) {
            return res.status(404).send('Customer not found.');
        }

        const storedPassword = results[0].password;

        if (bcrypt.compareSync(password, storedPassword)) {
            return res.status(200).send('Password is valid');
        } else {
            return res.status(401).send('Incorrect password');
        }
    });
};

const post_acc_app_form=(req,res)=>{

    console.log(req.body)
    const { account_type, branch_id, balance, customer_id } = req.body;
const ruthless=generateAccountNumber();
let status='pending'
    const query = `
        INSERT INTO Account (Account_no,Account_type, Branch_id, Balance, customer_id,status) 
        VALUES (?,?, ?, ?, ?,?)`;

    con.query(query, [ruthless,account_type, branch_id, balance, customer_id,status], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data into the database');
        } else {
            console.log('application submitted successfully:', result);
            res.status(200).render('acc_cre_succ_ani');
        }
    });
}
    const get_acc_app_form=(req,res)=>{
        const query = `
    SELECT customer_id, phone_number, name, Email, dateofbirth, address, city, state, pincode
    FROM customer
    WHERE customer_id = ?;
  `;
        con.execute(query, [req.session.customer_id], (err, results) => {
            if (err) {
                console.error('Error fetching customer details:', err);
                return res.status(500).send('Server Error');
            }

            if (results.length > 0) {
                const customerData = results[0];


                res.render('createaccount', {
                    customerId: customerData.customer_id,
                    pname: customerData.name,
                    pphno: customerData.phone_number,
                    pemail: customerData.Email,
                    pdob: customerData.dateofbirth,
                    padr: customerData.address,
                    pcity: customerData.city,
                    pstate: customerData.state,
                    pincode: customerData.pincode
                });
            } else {
                res.status(404).send('Customer not found');
            }
        });
    }
const _get_bal=(req,res)=>{
console.log(req.body)
        const accountNumber = req.body.account_no;

        const query = 'SELECT * FROM account WHERE account_no = ?'; // Adjust the query based on your actual table structure
        con.query(query, [accountNumber], (err, results) => {
            if (err) {
                console.error('Error fetching account details:', err);
                return res.status(500).render(`errorinsbal`,{errork:'Database error'})

            }

            if (results.length > 0) {
                console.log(results)
                res.send({ success: true, data: results[0] });
            } else {
                return res.status(500).render(`errorinsbal`,{errork:'Account not found '})

            }
        });


}

const with_draw = (req, res) => {
    const { acc_no, password } = req.body;
    const customerId = req.session.customer_id;
const amount=parseFloat(req.body.amount)
    if (!customerId) {
        return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Session expired or invalid. Please log in.');
    }

    const loginQuery = 'SELECT password FROM customer WHERE customer_id = ?';
    con.query(loginQuery, [customerId], (err, results) => {
        if (err || results.length === 0) {
            return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Database error or customer not found');
        }

        const storedPassword = results[0].password;
        if (!bcrypt.compareSync(password, storedPassword)) {
            return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Incorrect password');
        }

        if (!acc_no || !amount || amount <= 0 || isNaN(amount)) {
            return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Invalid input');
        }

        con.beginTransaction((err) => {
            if (err) {
                return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Transaction error');
            }

            const checkBalanceQuery = 'SELECT balance FROM account WHERE Account_no = ? AND customer_id = ?';
            con.query(checkBalanceQuery, [acc_no, customerId], (error, results) => {
                if (error || results.length === 0) {
                    return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Account not found');
                }

                const balance = results[0].balance;
                console.log("bal",balance,"amo",amount)

                if (balance < amount) {
                    console.log("bal",balance,"amo",amount)
                    return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Insufficient balance');
                }

                const updateBalanceQuery = 'UPDATE account SET balance = balance - ? WHERE Account_no = ? AND customer_id = ?';
                con.query(updateBalanceQuery, [amount, acc_no, customerId], (error) => {
                    if (error) {
                        return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Failed to update balance');
                    }

                    con.commit((err) => {
                        if (err) {
                            return handleTransactionFailure(req, res, acc_no, amount, 'withdrawal', 'Failed to commit transaction');
                        }

                        handleTransactionSuccess(req, res, acc_no, amount, 'withdrawal', balance-amount);
                    });
                });
            });
        });
    });
};

const deposit = (req, res) => {
    const { acc_no, password, amount } = req.body;
    const customerId = req.session.customer_id;

    if (!customerId) {
        return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Session expired or invalid. Please log in.');
    }

    const loginQuery = 'SELECT password FROM customer WHERE customer_id = ?';
    con.query(loginQuery, [customerId], (err, results) => {
        if (err || results.length === 0) {
            return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Database error or customer not found');
        }

        const storedPassword = results[0].password;
        if (!bcrypt.compareSync(password, storedPassword)) {
            return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Incorrect password');
        }

        if (!acc_no || !amount || amount <= 0 || isNaN(amount)) {
            return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Invalid input');
        }

        con.beginTransaction((err) => {
            if (err) {
                return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Transaction error');
            }

            const checkAccountQuery = 'SELECT balance FROM account WHERE Account_no = ? AND customer_id = ?';
            con.query(checkAccountQuery, [acc_no, customerId], (error, results) => {
                if (error || results.length === 0) {
                    return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Account not found');
                }

                const newBalance = parseFloat(results[0].balance) + parseFloat(amount);

                const updateBalanceQuery = 'UPDATE account SET balance = ? WHERE Account_no = ? AND customer_id = ?';
                con.query(updateBalanceQuery, [newBalance, acc_no, customerId], (error) => {
                    if (error) {
                        return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Failed to update balance');
                    }

                    con.commit((err) => {
                        if (err) {
                            return handleTransactionFailure(req, res, acc_no, amount, 'deposit', 'Failed to commit transaction');
                        }

                        handleTransactionSuccess(req, res, acc_no, amount, 'deposit', newBalance);
                    });
                });
            });
        });
    });
};

function handleTransactionFailure(req, res, acc_no, amount, type, message) {
    const status = 'failed';
    insertTransactionRecord(req, acc_no, amount, type, status);
    return res.status(500).render(`errorinsbal`,{errork:'insufficient balance '})

}

function handleTransactionSuccess(req, res, acc_no, amount, type, balance) {
    const status = 'success';
    insertTransactionRecord(req, acc_no, amount, type, status);
    res.status(200).send(renderSuccessPage(`${type.charAt(0).toUpperCase() + type.slice(1)} Successful`, `Your ${type} has been processed successfully. New Balance: ${balance}`));
}

function insertTransactionRecord(req, acc_no, amount, type, status) {
    const insertTransactionQuery = 'INSERT INTO transactions (customer_id, Account_no, amount, transaction_type, status) VALUES (?, ?, ?, ?, ?)';

    con.query(insertTransactionQuery, [req.session.customer_id, acc_no, amount, type, status], (error, results) => {
        if (error) {
            console.error('Failed to record transaction:', error);
        } else {
            console.log('Transaction recorded:', results);
        }
    });
}

function renderSuccessPage(title, message) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ff7e5f, #feb47b);
                    font-family: 'Arial', sans-serif;
                    overflow: hidden;
                }
                .container {
                    text-align: center;
                    animation: fadeIn 1s ease-in-out;
                }
                .message {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    transform: translateY(-50px);
                    animation: slideIn 0.5s forwards;
                }
                h1 {
                    color: #ff6f61;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }
                .button {
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    transition: background 0.3s;
                }
                .button:hover {
                    background: #45a049;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); }
                    to { transform: translateY(0); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="message">
                    <h1>🎉 ${title}!</h1>
                    <p>${message}</p>
                    <a href="/" class="button">Go to Dashboard</a>
                </div>
            </div>
            <script>
                setTimeout(() => { window.location.href = '/'; }, 5000);
            </script>
        </body>
        </html>
    `;
}






const getapplyLoan = (req, res) => {
    const query = 'SELECT Account_no FROM account WHERE customer_id = ?';
    const params = [req.session.customer_id];

    con.query(query, params, (err, accounts) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).render('errorinsbal', { errork: 'Internal Server Error' });
        }

        console.log(accounts)
        return res.render('loanapplicationform', { accounts:accounts });
    });
};

const applyLoan = (req, res) => {
    console.log(req.body);
    const { nmi, emi, loanAmount, tenure, interest, accountNumber } = req.body;
    let errors = [];

    if (!accountNumber || !nmi || !emi || !loanAmount || !tenure) {
        errors.push("Please fill out all the required fields.");
    }

    let maxEmiAllowed;
    switch (nmi) {
        case 'below_25k':
            maxEmiAllowed = 'below_5k';
            break;
        case '25k_50k':
            maxEmiAllowed = '15k_20k';
            break;
        case '50k_1lac':
            maxEmiAllowed = '30k_40k';
            break;
        case 'above_1lac':
            maxEmiAllowed = 'above_50k';
            break;
        default:
            errors.push("Invalid NMI selection.");
    }



    if (errors.length > 0) {
        console.log(errors)
        return res.status(500).render(`errorinsbal`,{errork:'Error saving loan application:'})

    }

    const sql = `
        INSERT INTO loan_applications (loan_id, customer_id, account_no, nmi, emi, loanAmount, tenure, repayment, status, interest) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const loanid = generateLoanId();
    const repayment = 'Monthly';
    const status = 'Pending';
console.log(tenure.slice(0,2))
    con.query(sql, [loanid, req.session.customer_id, accountNumber, nmi, emi, loanAmount, tenure.slice(0,2), repayment, status, interest], (err, result) => {
        if (err) {
            console.error('Error saving loan application:', err);
            return res.status(500).render('errorinsbal', { errork: 'Error saving loan application:' });
        }

        const insertedLoanId = result.insertId;


        res.status(200).render('loansuccessani', { loanid: loanid });
    });
};


function generateLoanId() {
    return Math.floor(10000 + Math.random() * 90000);
}

function generateAccountNumber() {
    const min = 100000000000;
    const max = 999999999999;
    const accountNumber = Math.floor(Math.random() * (max - min + 1)) + min;


    return accountNumber.toString();
}
const viewusers = (req, res) => {
    const query = 'SELECT * FROM customer';
    con.query(query, (err, accounts) => {
        if (err) {
            return res.status(500).send('Error retrieving users');
        }
        console.log(accounts);
        console.log('Number of accounts:', accounts.length);
        res.render('viewee', { accounts: accounts });
    });
}
const getapproveregectacc = (req, res) => {
    const a = `select Account_no, Account_type, customer_id, created_at from account where status=?`;
    con.query(a, ['pending'], (err, accounts) => {
        if (err) {
            console.log("cannot fetch applications");
            return res.status(500).send("Server error");
        }
        res.render('approveaccounts', { accounts: accounts });
    });
};


const approveorreject= (req, res) => {
    const { Account_no, action } = req.body;
console.log(req.body)
    let query;
    if (action === 'approve') {
        query = `UPDATE account SET status = 'approved' WHERE Account_no = ?`;
    } else if (action === 'reject') {
        query = `UPDATE account SET status = 'rejected' WHERE Account_no = ?`;
    } else {
        return res.status(400).send('Invalid action');
    }

    con.query(query, [Account_no], (err, result) => {
        if (err) {
            console.log("Error updating account status", err);
            return res.status(500).send("An error occurred");
        }
        res.redirect('/approveorreject');
    });
};
const getdeactivator=(req,res)=>{
    const a = `select Account_no, Account_type, customer_id, created_at from account where status=?`;
    con.query(a, ['approved'], (err, accounts) => {
        if (err) {
            console.log("cannot fetch applications");
            return res.status(500).send("Server error");
        }
        res.render('deactivateaccounts', { accounts: accounts });
    });
}
const deactivateaccount=(req, res) => {

    const { Account_no } = req.body;
let status='inactive'
    const query = 'UPDATE Account SET status=? WHERE Account_no = ?';
    con.query(query, [status,Account_no], (err) => {
        if (err) {
            console.log(err)
            return res.status(500).send('Error deactivating account');
        }
        console.log(`Account ${Account_no} has been deactivated`);
        return res.status(500).render(`errorinsbal`,{errork:`Account ${Account_no} has been deactivated`})


    });
}
const viewcustomer=(req, res) => {
    const { customerId } = req.params;

    const query = 'SELECT * FROM customer WHERE customer_id = ?';
    con.query(query, [customerId], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving customer information');
        }
        return res.status(500).render(`errorinsbal`,{errork: results[0]})

    });
};
const editcustomer=(req, res) => {
    const { customerId, phoneNumber, address } = req.body;

    const query = 'UPDATE customer SET phone_number = ?, address = ? WHERE customer_id = ?';
    db.query(query, [phoneNumber, address, customerId], (err) => {
        if (err) {
            return res.status(500).send('Error updating customer information');
        }
        return res.status(500).render(`errorinsbal`,{errork:'Customer information updated'})

    });
};

const viewtrans = (req, res) => {
    const tran = `SELECT * FROM transactions`;

    con.query(tran, (err, results) => {
        if (err) {
            console.log(err)
            console.log("Cannot fetch transaction query");
            return res.status(500).send("Database error!!");
        }
        console.log(results)
        res.render('admtrans1', { transactions: results });
    });
};


function adminsertTransactionRecord(req, acc_no,customer_id, amount, type, status) {
    const insertTransactionQuery = 'INSERT INTO transactions (customer_id, Account_no, amount, transaction_type, status) VALUES (?, ?, ?, ?, ?)';

    con.query(insertTransactionQuery, [customer_id, acc_no, amount, type, status], (error, results) => {
        if (error) {
            console.error('Failed to record transaction:', error);
        } else {
            console.log('Transaction recorded:', results);
        }
    });
}
const reversetransaction = (req, res) => {
    const getTransactionQuery = 'SELECT Account_no, customer_id, amount FROM transactions WHERE id = ? and status !="reversed"';
    const { Transaction_id } = req.body;
    console.log(req.body);

    con.query(getTransactionQuery, [Transaction_id], (err, results) => {
        if (err) {
            console.error("Error fetching transaction:", err);
            return res.status(500).render(`errorinsbal`,{errork:'Error fetching transaction details'})


        }

        if (results.length === 0) {
            return res.status(404).render(`errorinsbal`,{errork: 'Transaction not found or already reversed' })

        }

        const { Account_no, customer_id, amount } = results[0];

        con.beginTransaction((err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                return adminsertTransactionRecord(req, Account_no, customer_id, amount, 'reversal', 'fail');
            }
const updatest=`update transactions set status="Reversed" where id=?`
            const updateBalanceQuery = 'UPDATE account SET balance = balance + ?  WHERE Account_no = ? AND customer_id = ?';
            con.query(updateBalanceQuery, [amount, Account_no, customer_id], (error) => {
                if (error) {
                    console.error("Error updating balance:", error);
                    return con.rollback(() => adminsertTransactionRecord(req, Account_no, customer_id, amount, 'reversal', 'fail'));
                }

                const insertReversalQuery = `
                    INSERT INTO transactions (Account_no, customer_id, amount, transaction_type, status) 
                    VALUES (?, ?, ?, 'reversal', 'Reversed')`;
                con.query(insertReversalQuery, [Account_no, customer_id, -amount], (err) => {
                    if (err) {
                        console.error("Error inserting reversal transaction:", err);
                        return con.rollback(() => adminsertTransactionRecord(req, Account_no, customer_id, amount, 'reversal', 'fail'));
                    }

                    con.commit((err) => {
                        if (err) {
                            console.error("Error committing transaction:", err);
                            return con.rollback(() => adminsertTransactionRecord(req, Account_no, customer_id, amount, 'reversal', 'fail'));
                        }
con.query(updatest,[Transaction_id]);
                        adminsertTransactionRecord(req, Account_no, customer_id, amount, 'reversal', 'success');
                        res.redirect('/toreverseviewtrans')
                    });
                });
            });
        });
    });
};


const reviewloanaiations=(req, res) => {
    const query = 'SELECT * FROM loan_applications';
    con.query(query, (err, loans) => {
        if (err) {
            return res.status(500).send('Error retrieving loan applications');
        }
        res.render('lanviewview',{loans:loans});
    });
}
const getpendloans=(req,res)=>{
    const query = 'SELECT * FROM loan_applications where status="pending"';
    con.query(query, (err, loans) => {
        if (err) {
            return res.status(500).send('Error retrieving loan applications');
        }
        res.render('lanview',{loans:loans});
    });
}
const apprejloans = (req, res) => {
    const { loan_id, action } = req.body;
    const validActions = ['approve', 'reject'];

    // Check if the action is valid (either 'approve' or 'reject')
    if (!validActions.includes(action)) {
        return res.status(400).send('Invalid action');
    }

    // Update loan status in the loan_applications table
    const updateLoanQuery = 'UPDATE loan_applications SET status = ? WHERE loan_id = ?';
    con.query(updateLoanQuery, [action, loan_id], (err) => {
        if (err) {
            return res.status(500).send('Error updating loan status');
        }

        // Get the account number associated with the loan_id
        const getAccountQuery = 'SELECT account_no FROM loan_applications WHERE loan_id = ?';
        con.query(getAccountQuery, [loan_id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).send('Error retrieving account information');
            }

            const Account_no = results[0].account_no;

            // Retrieve the current balance of the account
            const getBalanceQuery = 'SELECT Balance FROM account WHERE Account_no = ?';
            con.query(getBalanceQuery, [Account_no], (err, balanceResults) => {
                if (err || balanceResults.length === 0) {
                    return res.status(500).send('Error retrieving balance');
                }

                let currentBalance = parseFloat(balanceResults[0].Balance); // Convert Balance to float for calculations

                // If the action is 'approve', fetch the loan amount and update the balance
                if (action === 'approve') {
                    const loanAmountQuery = 'SELECT loanAmount FROM loan_applications WHERE loan_id = ?';
                    con.query(loanAmountQuery, [loan_id], (err, loanResults) => {
                        if (err || loanResults.length === 0) {
                            return res.status(500).send('Error retrieving loan amount');
                        }

                        const loanAmount = parseFloat(loanResults[0].loanAmount);
                        const newBalance = currentBalance + loanAmount; // Add loan amount to balance

                        // Update the account balance in the accounts table
                        const updateAccountQuery = 'UPDATE account SET Balance = ? WHERE Account_no = ?';
                        con.query(updateAccountQuery, [newBalance, Account_no], (err) => {
                            if (err) {
                                return res.status(500).send('Error updating account balance');
                            }
                            res.redirect("/approve-loans"); // Redirect after success
                        });
                    });
                } else if (action === 'reject') {
                    // If loan is rejected, balance remains the same
                    const newBalance = currentBalance;

                    // Update the account balance in the accounts table
                    const updateAccountQuery = 'UPDATE account SET Balance = ? WHERE Account_no = ?';
                    con.query(updateAccountQuery, [newBalance, Account_no], (err) => {
                        if (err) {
                            return res.status(500).send('Error updating account balance');
                        }
                        res.redirect("/approve-loans"); // Redirect after success
                    });
                }
            });
        });
    });
};



const viewactiveloans=(req, res) => {
    const query = 'SELECT * FROM loan_applications WHERE status = "approve"';
    con.query(query, (err, loans) => {
        if (err) {
            return res.status(500).send('Error retrieving loan applications');
        }
        res.render('lanviewview',{loans:loans});
    });
};
const toreverseviewtrans=(req,res)=>{

    const a = `select * from transactions where status!="Reversed" `;
    con.query(a, (err, transactions) => {
        if (err) {
            console.log("cannot fetch applications");
            return res.status(500).send("Server error");
        }
        res.render('admtrans', { transactions: transactions });
    });
}

const help=(req,res)=>{
    res.render('helphelp')
}
const admlogout=(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Cannot log out. Please try again!");
        }
        console.log("admin logged out");
        res.redirect('./dashboard.html');
    });



}
module.exports = {getpendloans,getdeactivator,
    getapproveregectacc,
    deactivateaccount,viewcustomer,editcustomer,viewtrans
    ,viewactiveloans,admlogout,
    approveorreject,
    toreverseviewtrans,
    reversetransaction,
    reviewloanaiations,
    apprejloans,
    viewusers,
    getapplyLoan,
    applyLoan,
    validatepass,
    with_draw,
    deposit,
    _get_bal,
    post_acc_app_form,
    get_acc_app_form,
    gettransaction_history,
    adminpost,
    admget,
    getdashboard,
    updpass,
    profileget,help,
    profilepost,
    registerget,
    baseget,
    loginget,
    loginpost,
    logoutget,
    registerpost,
    recoveryget,
    recoverypost,
};

function rancusid() {
    // Generate a random number between 0 and 999999
    const randomNum = Math.floor(Math.random() * 1000000);
    // Pad the number with leading zeros to ensure it's 6 digits
    return String(randomNum).padStart(6, '0');
}