const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loginFilePath = './login.txt'; 
const petsFilePath = './pets.json'; 

// 设置视图引擎为 EJS 并指定视图文件夹路径
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // 确保路径正确

// 设置静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 读取宠物信息的函数
function getPets() {
    let pets = [];
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }
    return pets;
}

// 根路径路由，渲染主页
app.get('/', (req, res) => {
    const { message, username } = req.query;
    const pets = getPets();
    res.render('a3q8', { message: message || null, username: username || null, pets: pets });
});

// 提交宠物信息的路由
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

// 用户认证路由
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

// 用户登出路由
app.get('/logout', (req, res) => {
    res.redirect('/?message=Logged out successfully.');
});

// 显示主页
app.get('/home', (req, res) => {
    res.render('a3q8', { message: null, username: null });  
});

// 显示宠物信息页面
app.get('/pets', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pets.html'));
});

// 隐私声明路由
app.get('/privacy', (req, res) => {
    res.send('Privacy and Disclaimer Statement'); 
});

// 浏览宠物页面
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

// 用户添加宠物页面
app.get('/have-pet', (req, res) => {
    const username = req.query.username; 
    res.render('have_pet', { username });
});

// 启动服务器
const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
