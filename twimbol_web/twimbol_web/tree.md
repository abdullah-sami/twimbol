src/ 
├── api/ 
│ ├── axios.js # configured axios instance + interceptors 
│ ├── auth.js # login, register, forgot-password calls 
│ ├── posts.js # posts + interactions 
│ ├── reels.js # reels feed + upload 
│ ├── user.js # profile, follow, block 
│ ├── notifications.js # list, mark-read, preferences 
│ └── events.js # events endpoints 
│ ├── components/ 
    │ ├── layout/ 
    │ │ ├── Navbar.jsx 
    │ │ └── Sidebar.jsx 
    │ ├── reel/ 
    │ │ ├── ReelCard.jsx 
    │ │ └── ReelComments.jsx 
    │ ├── post/ 
    │ │ ├── PostCard.jsx 
    │ │ └── PostActions.jsx 
    │ ├── ui/ 
    │ │ ├── Button.jsx 
    │ │ ├── Modal.jsx 
    │ │ └── Avatar.jsx 
    │ └── auth/ 
    │ └── ProtectedRoute.jsx 
    │ ├── pages/ 
    │ ├── Landing.jsx 
    │ ├── Login.jsx 
    │ ├── Signup.jsx 
    │ ├── ForgotPassword.jsx 
    │ ├── Home.jsx # reels feed 
    │ ├── ReelWatch.jsx 
    │ ├── Posts.jsx 
    │ ├── ReadPost.jsx 
    │ ├── UserProfile.jsx 
    │ ├── EditProfile.jsx 
    │ ├── Settings.jsx 
    │ ├── Events.jsx 
    │ ├── ApplyCreator.jsx 
    │ └── CreatorDashboard.jsx 
│ ├── store/ 
│ ├── authStore.js # JWT tokens, current user 
│ └── notifStore.js # notification badge count 
│ ├── hooks/ 
│ ├── useAuth.js 
│ └── usePagination.js 
│ ├── App.jsx # router + route tree 
└── main.jsx