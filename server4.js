const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loginFilePath = './login.txt'; 
const petsFilePath = './pets.json'; 

// 设置模板引擎为 EJS
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

// 设置静态文件路径
app.use(express.static(path.join(__dirname, 'public')));

// 初始页面路由，处理登录、登出后的页面显示
app.get('/', (req, res) => {
    const { message, username } = req.query;
    const pets = getPets();
    res.render('a3q8', { message: message || null, username: username || null, pets: pets });
});

// 提交宠物信息处理
app.post('/submit-pet', (req, res) => {
    const { petType, petName, petAge, petGender, petDescription, ownerName, ownerEmail } = req.body;
    const username = req.query.username; // 从查询参数中获取用户名

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
        username // 保存与宠物信息相关联的用户名
    };

    pets.push(newPet);

    fs.writeFileSync(petsFilePath, JSON.stringify(pets, null, 2));

    res.redirect(`/browse-pets?username=${username}`);
});


// 用户认证处理（注册或登录）
app.post('/auth', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading login file.');
        }

        const users = data.split('\n').filter(line => line).map(line => line.split(':'));
        const user = users.find(([user, pass]) => user === username);

        if (user) {
            // 用户存在，验证密码
           if (user[1] === password) {
                res.redirect(`/?message=Login successful.&username=${username}`);
            } else {
                res.redirect(`/?message=Invalid password.`);
            }
        } else {
            // 用户不存在，注册新账户
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

// 用户登出处理
app.get('/logout', (req, res) => {
    // 清除用户名信息并重定向回登录页面
    res.redirect('/?message=Logged out successfully.');
});

// 其他路由示例
app.get('/home', (req, res) => {
    res.render('a3q8', { message: null, username: null });  // 初始页面，无信息显示
});

app.get('/pets', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pets.html'));
});

app.get('/privacy', (req, res) => {
    res.send('Privacy and Disclaimer Statement'); // 简单的文本响应
});

// 提交宠物信息处理
// 提交宠物信息处理
app.post('/submit-pet', (req, res) => {
    const { petType, petName, petAge, petGender, petDescription, ownerName, ownerEmail } = req.body;
    const username = req.query.username; // 从查询参数中获取用户名

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
        username // 保存与宠物信息相关联的用户名
    };

    pets.push(newPet);

    fs.writeFileSync(petsFilePath, JSON.stringify(pets, null, 2));

    res.redirect(`/browse-pets?username=${username}`);
});

// 浏览可用宠物页面
app.get('/browse-pets', (req, res) => {
    const username = req.query.username; // 获取当前登录的用户名
    let pets = [];
    
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }

    // 根据用户名过滤宠物信息
    const filteredPets = pets.filter(pet => pet.username === username);

    res.render('browse_pets', { pets: filteredPets });
});

// 设置查看宠物信息的页面
app.get('/have-pet', (req, res) => {
    const username = req.query.username; // 获取当前登录的用户名
    res.render('have_pet', { username });
});

// 启动服务器
const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});