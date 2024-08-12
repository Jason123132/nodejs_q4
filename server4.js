const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loginFilePath = './login.txt'; 
const petsFilePath = './pets.json'; 


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function getPets() {
    let pets = [];
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }
    return pets;
}


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    const { message, username } = req.query;
    const pets = getPets();
	
	console.log("Looking for view in:", path.join(__dirname, 'views', 'a3q8.ejs'));
	
    res.render('a3q8', { message: message || null, username: username || null, pets: pets });
});


app.post('/submit-pet', (req, res) => {
    const { petType, petName, petAge, petGender, petDescription, ownerName, ownerEmail } = req.body;
    const username = req.query.username;

    if (!petType || !petName || !petAge || !petGender || !petDescription || !ownerName || !ownerEmail || !username) {
        return res.status(400).send("Invalid data");
    }

    let pets = [];
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }

    const newPet = { 
        petType, 
        petName, 
        petAge, 
        petGender, 
        petDescription, 
        ownerName, 
        ownerEmail,
        username 
    };

    pets.push(newPet);

    fs.writeFileSync(petsFilePath, JSON.stringify(pets, null, 2));

    res.redirect(`/browse-pets?username=${username}`);
});



app.post('/auth', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading login file.');
        }

        const users = data.split('\n').filter(line => line).map(line => line.split(':'));
        const user = users.find(([user, pass]) => user === username);

        if (user) {
           
           if (user[1] === password) {
                res.redirect(`/?message=Login successful.&username=${username}`);
            } else {
                res.redirect(`/?message=Invalid password.`);
            }
        } else {
            
            const newUserInfo = `${username}:${password}\n`;
            fs.appendFile(loginFilePath, newUserInfo, (err) => {
                if (err) {
                    return res.status(500).send('Error registering new user.');
                }
                res.redirect(`/?message=User registered successfully.&username=${username}`);
            });
        }
    });
});


app.get('/logout', (req, res) => {

    res.redirect('/?message=Logged out successfully.');
});


app.get('/home', (req, res) => {
    res.render('a3q8', { message: null, username: null });  
});

app.get('/pets', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pets.html'));
});

app.get('/privacy', (req, res) => {
    res.send('Privacy and Disclaimer Statement'); 
});




app.get('/browse-pets', (req, res) => {
    const username = req.query.username; 
    let pets = [];
    
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }

   
    const filteredPets = pets.filter(pet => pet.username === username);

    res.render('browse_pets', { pets: filteredPets });
});



app.get('/have-pet', (req, res) => {
    const username = req.query.username; 
    res.render('have_pet', { username });
});


const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
