var isLoginMode = true;
var userData = {};


function toggleMode(){
    var loginform = document.getElementById('loginForm');
    var signupform = document.getElementById('signupForm');
    var signupbtn = document.getElementById('signupBtn');
    
    if(isLoginMode){
        loginform.style.display = 'none';
        signupform.style.display = 'block';
        isLoginMode = false;
        populateDateDropdowns();
    }else{
        loginform.style.display = 'block';
        signupform.style.display = 'none';
        isLoginMode = true;
    }
}

function populateDateDropdowns(){
    var daySelect = document.getElementById('birthDay');
    var yearSelect = document.getElementById('birthYear');
    
    
    for(var i=1; i<=31; i++){
        var option = document.createElement('option');
        option.value = i;
        option.text = i;
        daySelect.appendChild(option);
    }
    
    
    var currentYear = new Date().getFullYear();
    for(var year = currentYear; year >= 1950; year--){
        var option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    }
}

function validateEmail(email){
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone){
    var phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function showError(elementId, show){
    var errorElement = document.getElementById(elementId);
    if(show){
        errorElement.style.display = 'block';
    }else{
        errorElement.style.display = 'none';
    }
}

function showSuccess(elementId, show){
    var successElement = document.getElementById(elementId);
    if(show){
        successElement.style.display = 'block';
    }else{
        successElement.style.display = 'none';
    }
}


document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    
    var emailOrPhone = document.getElementById('emailOrPhone').value;
    var password = document.getElementById('passwrd').value;
    
    var isValid = true;
    
    
    if(!validateEmail(emailOrPhone) && !validatePhone(emailOrPhone)){
        showError('emailError', true);
        isValid = false;
    }else{
        showError('emailError', false);
    }
    
    
    if(password.length < 6){
        showError('passwordError', true);
        isValid = false;
    }else{
        showError('passwordError', false);
    }
    
    if(isValid){
        
        console.log('Login attempt:', emailOrPhone, password);
        alert('Login sucessful! Welcome to PacBook!');
        
        
        userData.emailOrPhone = emailOrPhone;
        localStorage.setItem('pacbookUser', JSON.stringify(userData));
        
        
        window.location.href = 'dashboard.html';
    }
});


document.getElementById('signupForm').addEventListener('submit', function(e){
    e.preventDefault();
    
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var email = document.getElementById('emailSignup').value;
    var password = document.getElementById('passwordSignup').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var agreeTerms = document.getElementById('agreeTerms').checked;
    
    var isValid = true;
    
    
    if(!validateEmail(email)){
        showError('emailSignupError', true);
        isValid = false;
    }else{
        showError('emailSignupError', false);
    }
    
    
    if(password.length < 6){
        showError('passwordSignupError', true);
        isValid = false;
    }else{
        showError('passwordSignupError', false);
    }
    
    
    if(password !== confirmPassword){
        showError('confirmPasswordError', true);
        isValid = false;
    }else{
        showError('confirmPasswordError', false);
    }
    
    
    if(!agreeTerms){
        showError('termsError', true);
        isValid = false;
    }else{
        showError('termsError', false);
    }
    
    if(isValid){
        
        userData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            birthMonth: document.getElementById('birthMonth').value,
            birthDay: document.getElementById('birthDay').value,
            birthYear: document.getElementById('birthYear').value,
            gender: document.querySelector('input[name="gendr"]:checked')?.value
        };
        
        
        localStorage.setItem('pacbookUser', JSON.stringify(userData));
        
        
        showSuccess('successMsg', true);
        
        
        setTimeout(function(){
            alert('Welcome to PacBook! Your account has been created.');
            window.location.href = 'dashboard.html';
        }, 1500);
    }
});

function forgotPassword(){
    var email = prompt('Enter your email address:');
    if(email && validateEmail(email)){
        alert('Password reset link sent to ' + email);
    }else{
        alert('Please enter a valid email address.');
    }
}


window.onload = function(){
    var savedUser = localStorage.getItem('pacbookUser');
    if(savedUser){
        userData = JSON.parse(savedUser);
        console.log('User data loaded:', userData);
    }
};


function checkUserStatus(){
    if(localStorage.getItem('pacbookUser')){
        return true;
    }
    return false;
}


document.addEventListener('DOMContentLoaded', function(){
    console.log('PacBook login page loaded');
    
    
    var inputs = document.querySelectorAll('.txtInput');
    inputs.forEach(function(input){
        input.addEventListener('focus', function(){
            this.style.borderColor = '#667eea';
        });
        
        input.addEventListener('blur', function(){
            this.style.borderColor = '#ddd';
        });
    });
    
    
    var passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(function(input){
        input.addEventListener('input', function(){
            if(this.value.length > 0){
                this.style.backgroundColor = '#f9f9f9';
            }else{
                this.style.backgroundColor = 'white';
            }
        });
    });
});


function simulateLoading(){
    var loginBtn = document.getElementById('loginBtn');
    var createBtn = document.getElementById('createAccountBtn');
    
    if(loginBtn){
        loginBtn.innerHTML = 'Logging in...';
        loginBtn.disabled = true;
        
        setTimeout(function(){
            loginBtn.innerHTML = 'Log In';
            loginBtn.disabled = false;
        }, 2000);
    }
    
    if(createBtn){
        createBtn.innerHTML = 'Creating Account...';
        createBtn.disabled = true;
        
        setTimeout(function(){
            createBtn.innerHTML = 'Sign Up';
            createBtn.disabled = false;
        }, 2000);
    }
}


var socialMediaData = {
    platform: 'PacBook',
    version: '1.0.0',
    users: [],
    posts: [],
    currentUser: null
};


function addUser(userInfo){
    socialMediaData.users.push(userInfo);
    console.log('User added to PacBook:', userInfo);
}


function getUserById(userId){
    return socialMediaData.users.find(function(user){
        return user.id === userId;
    });
}


function createPost(content, userId){
    var post = {
        id: Date.now(),
        content: content,
        userId: userId,
        timestamp: new Date(),
        likes: 0,
        comments: []
    };
    
    socialMediaData.posts.push(post);
    return post;
}
