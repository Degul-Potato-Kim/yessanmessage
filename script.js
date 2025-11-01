// Firebase 설정 
const firebaseConfig = {
  apiKey: "AIzaSyBOI3YuXjSMbc9Ah1e1-NeFl7dIkvJCwhc",
  authDomain: "ysm-2025.firebaseapp.com",
  projectId: "ysm-2025",
  storageBucket: "ysm-2025.firebasestorage.app",
  messagingSenderId: "553529352491",
  appId: "1:553529352491:web:7ce8513f4b3b89a994656e",
  measurementId: "G-PR90QE3316"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 전역 변수
let currentUser = null;
let posts = [];
let currentPostId = null;
let currentBoard = 'all';

// 마스터 계정 이메일 목록 
const MASTER_ACCOUNTS = [    'master@ysm.com' ];

// DOM 요소들
const authSection = document.getElementById('authSection');
const signupSection = document.getElementById('signupSection');
const feedSection = document.getElementById('feedSection');
const writeSection = document.getElementById('writeSection');
const detailSection = document.getElementById('detailSection');
const profileSection = document.getElementById('profileSection');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const writeForm = document.getElementById('writeForm');

const postsContainer = document.getElementById('postsContainer');
const postDetail = document.getElementById('postDetail');
const popularPostsContainer = document.getElementById('popularPostsContainer');
const boardStats = document.getElementById('boardStats');

// 네비게이션 버튼들
const navHome = document.getElementById('navHome');
const navWrite = document.getElementById('navWrite');
const navProfile = document.getElementById('navProfile');

// 인증 관련 버튼들
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// 뒤로가기 버튼들
const backToFeedBtn = document.getElementById('backToFeedBtn');
const backToFeedFromDetailBtn = document.getElementById('backToFeedFromDetailBtn');
const backToFeedFromProfileBtn = document.getElementById('backToFeedFromProfileBtn');

// 모달 관련
const searchBtn = document.getElementById('searchBtn');
const notificationBtn = document.getElementById('notificationBtn');
const searchModal = document.getElementById('searchModal');
const notificationModal = document.getElementById('notificationModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const closeNotificationModal = document.getElementById('closeNotificationModal');

// 프로필 수정 모달 관련
const profileEditModal = document.getElementById('profileEditModal');
const closeProfileEditModal = document.getElementById('closeProfileEditModal');
const profileEditForm = document.getElementById('profileEditForm');
const editProfileBtn = document.getElementById('editProfileBtn');

// 마스터 패널 관련
const masterPanelModal = document.getElementById('masterPanelModal');
const closeMasterPanelModal = document.getElementById('closeMasterPanelModal');
const masterPanelBtn = document.getElementById('masterPanelBtn');
const deleteAllPostsBtn = document.getElementById('deleteAllPostsBtn');
const viewAllUsersBtn = document.getElementById('viewAllUsersBtn');
const systemStatsBtn = document.getElementById('systemStatsBtn');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 앱 초기화
function initializeApp() {
    console.log('앱 초기화 시작');
    console.log('Firebase 설정:', firebaseConfig);
    
    // Firebase 인증 상태 감지
    auth.onAuthStateChanged((user) => {
        console.log('인증 상태 변경:', user ? '로그인됨' : '로그아웃됨');
        currentUser = user;
        if (user) {
            console.log('사용자 정보:', user.uid, user.email);
            showFeed();
            loadPosts();
        } else {
            showAuth();
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 인증 폼
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // 네비게이션
    navHome.addEventListener('click', showFeed);
    navWrite.addEventListener('click', showWrite);
    navProfile.addEventListener('click', showProfile);
    
    // 인증 버튼들
    signupBtn.addEventListener('click', () => showSection('signupSection'));
    loginBtn.addEventListener('click', () => showSection('authSection'));
    logoutBtn.addEventListener('click', handleLogout);
    
    // 뒤로가기 버튼들
    backToFeedBtn.addEventListener('click', showFeed);
    backToFeedFromDetailBtn.addEventListener('click', showFeed);
    backToFeedFromProfileBtn.addEventListener('click', showFeed);
    
    // 글 작성 폼
    writeForm.addEventListener('submit', handleWritePost);
    
    // 모달 관련
    searchBtn.addEventListener('click', () => showModal('searchModal'));
    notificationBtn.addEventListener('click', () => showModal('notificationModal'));
    closeSearchModal.addEventListener('click', () => hideModal('searchModal'));
    closeNotificationModal.addEventListener('click', () => hideModal('notificationModal'));
    
    // 프로필 수정 관련 (존재 여부 확인 후 리스너 등록)
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => showModal('profileEditModal'));
    } else {
        console.warn('editProfileBtn 요소를 찾을 수 없습니다. id가 변경되었는지 확인하세요.');
    }
    if (closeProfileEditModal) {
        closeProfileEditModal.addEventListener('click', () => hideModal('profileEditModal'));
    } else {
        console.warn('closeProfileEditModal 요소를 찾을 수 없습니다.');
    }
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', handleProfileEdit);
    } else {
        console.warn('profileEditForm 요소를 찾을 수 없습니다.');
    }
    
    // 마스터 패널 관련
    masterPanelBtn.addEventListener('click', () => showModal('masterPanelModal'));
    closeMasterPanelModal.addEventListener('click', () => hideModal('masterPanelModal'));
    deleteAllPostsBtn.addEventListener('click', handleDeleteAllPosts);
    viewAllUsersBtn.addEventListener('click', handleViewAllUsers);
    systemStatsBtn.addEventListener('click', handleSystemStats);
    
    // 새로고침 버튼
    document.getElementById('refreshBtn').addEventListener('click', loadPosts);
    
    // 게시판 선택기
    document.getElementById('boardSelector').addEventListener('change', (e) => {
        currentBoard = e.target.value;
        updateBoardSelector();
        loadPosts();
    });
}

// 섹션 표시/숨김
function showSection(sectionId) {
    const sections = [authSection, signupSection, feedSection, writeSection, detailSection, profileSection];
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// 메인 피드 표시
function showFeed() {
    showSection('feedSection');
    updateNavActive('navHome');
    updateBoardSelector(); // 게시판 선택기 업데이트
    loadPopularPosts(); // 인기 게시물 로드
    loadPosts();
}

// 글 작성 페이지 표시
function showWrite() {
    if (!currentUser) {
        showAuth();
        return;
    }
    showSection('writeSection');
    updateNavActive('navWrite');
}

// 마이페이지 표시
function showProfile() {
    if (!currentUser) {
        showAuth();
        return;
    }
    showSection('profileSection');
    updateNavActive('navProfile');
    loadUserProfile();
    
    // 마스터 계정인 경우 관리자 패널 버튼 표시
    if (isMasterAccount(currentUser)) {
        masterPanelBtn.classList.remove('hidden');
    } else {
        masterPanelBtn.classList.add('hidden');
    }
}

// 인증 페이지 표시
function showAuth() {
    showSection('authSection');
    updateNavActive('');
}

// 글 상세 페이지 표시
function showPostDetail(postId) {
    currentPostId = postId;
    showSection('detailSection');
    loadPostDetail(postId);
}

// 네비게이션 활성 상태 업데이트
function updateNavActive(activeId) {
    const navItems = [navHome, navWrite, navProfile];
    navItems.forEach(item => item.classList.remove('active'));
    if (activeId) {
        document.getElementById(activeId).classList.add('active');
    }
}

// 모달 표시/숨김
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// 프로필 수정 모달 열기: 현재 값을 채워줌
async function openProfileEditModal() {
    if (!currentUser) { alert('로그인이 필요합니다.'); return; }
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        const nickInput = document.getElementById('editNickname');
        const schoolInput = document.getElementById('editschool');
        if (nickInput) nickInput.value = userData.nickname || '';
        if (schoolInput) schoolInput.value = userData.school || '';
        showModal('profileEditModal');
    } catch (e) {
        console.error('프로필 수정 모달 열기 실패:', e);
        showModal('profileEditModal');
    }
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showFeed();
    } catch (error) {
        alert('로그인 실패: ' + error.message);
    }
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();
    const nickname = document.getElementById('signupNickname').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const school = document.getElementById('signupschool').value;
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // 사용자 프로필 정보 저장
        await db.collection('users').doc(user.uid).set({
            nickname: nickname,
            school: school,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showFeed();
    } catch (error) {
        alert('회원가입 실패: ' + error.message);
    }
}

// 로그아웃 처리
async function handleLogout() {
    try {
        await auth.signOut();
        showAuth();
    } catch (error) {
        alert('로그아웃 실패: ' + error.message);
    }
}

// 글 작성 처리
async function handleWritePost(e) {
    e.preventDefault();
    const board = document.getElementById('postBoard').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!board) {
        alert('게시판을 선택해주세요.');
        return;
    }
    
    try {
        let imageUrl = null;
        
        // 이미지 업로드
        if (imageFile) {
            const storageRef = storage.ref();
            const imageRef = storageRef.child(`posts/${Date.now()}_${imageFile.name}`);
            await imageRef.put(imageFile);
            imageUrl = await imageRef.getDownloadURL();
        }
        
        // 사용자 프로필에서 정보 가져오기
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        // 게시물 저장
        const postData = {
            board: board,
            title: title,
            content: content,
            imageUrl: imageUrl,
            authorId: currentUser.uid,
            authorNickname: userData.nickname || currentUser.displayName || '익명',
            authorschool: userData.school || '학교 미설정',
            likes: 0,
            likedBy: [],
            comments: [], // 항상 빈 배열로 초기화
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('posts').add(postData);
        
        // 폼 초기화
        writeForm.reset();
        
        // 성공 메시지 표시
        alert('게시물이 성공적으로 업로드되었습니다!');
        
        // 홈 화면으로 자동 이동
        showFeed();
        loadPosts();
    } catch (error) {
        alert('글 작성 실패: ' + error.message);
    }
}

//프로필
        async function handleProfileEdit(e) {
        e.preventDefault();
    if (!currentUser) { alert('로그인이 필요합니다.'); return; }
    const nickname = document.getElementById('editNickname').value.trim();
    // HTML uses id="editschool" (lowercase s), fix selector
    const school = document.getElementById('editschool').value.trim();

        try {
            await db.collection('users').doc(currentUser.uid).update({
            nickname,
            school,
            });
            alert('프로필이 수정되었습니다.');
            hideModal('profileEditModal');
            loadUserProfile(); // 화면 즉시 갱신
        } catch (error) {
            alert('프로필 수정 실패: ' + error.message);
        }
        }

// 인기 게시물 로드
function loadPopularPosts() {
    popularPostsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><span>로딩 중...</span></div>';
    
    db.collection('posts')
        .orderBy('likes', 'desc')
        .limit(3)
        .onSnapshot((snapshot) => {
            popularPostsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                popularPostsContainer.innerHTML = '<div class="no-posts">인기 게시물이 없습니다.</div>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                renderPopularPost(post);
            });
        }, (error) => {
            console.error('인기 게시물 로드 실패:', error);
            popularPostsContainer.innerHTML = '<div class="error">인기 게시물을 불러오는데 실패했습니다.</div>';
        });
}

// 게시물 목록 로드
function loadPosts() {
    postsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><span>로딩 중...</span></div>';
    
    // Firebase의 복합 쿼리 제한을 고려하여 모든 게시물을 가져온 후 클라이언트에서 필터링
    db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(50) // 더 많은 게시물을 가져와서 필터링
        .onSnapshot((snapshot) => {
            posts = [];
            postsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                const boardName = getBoardName(currentBoard);
                postsContainer.innerHTML = `<div class="no-posts">${boardName}에 아직 게시물이 없습니다.</div>`;
                return;
            }
            
            let filteredPosts = [];
            
            snapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                posts.push(post);
                
                // 게시판 필터링
                if (currentBoard === 'all' || post.board === currentBoard) {
                    filteredPosts.push(post);
                }
            });
            
            // 최신 순으로 정렬
            filteredPosts.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return bTime - aTime;
            });
            
            // 최대 20개만 표시
            filteredPosts.slice(0, 20).forEach(post => {
                renderPost(post);
            });
            
            if (filteredPosts.length === 0) {
                const boardName = getBoardName(currentBoard);
                postsContainer.innerHTML = `<div class="no-posts">${boardName}에 아직 게시물이 없습니다.</div>`;
            }
            
            // 게시판 통계 업데이트
            updateBoardStats();
        }, (error) => {
            console.error('게시물 로드 실패:', error);
            postsContainer.innerHTML = '<div class="error">게시물을 불러오는데 실패했습니다.</div>';
        });
}

// 마스터 계정 권한 체크
function isMasterAccount(user) {
    if (!user || !user.email) return false;
    return MASTER_ACCOUNTS.includes(user.email);
}

// 게시판 이름 가져오기
function getBoardName(boardValue) {
    const boardNames = {
        'all': '전체 게시판',
        'school1': '학교1',
        'school2': '학교2',
        'school3': '학교3'
    };
    return boardNames[boardValue] || '알 수 없는 게시판';
}

// 게시판 선택기 업데이트
function updateBoardSelector() {
    const selector = document.getElementById('boardSelector');
    const feedHeader = document.querySelector('.feed-header h2');
    
    if (currentBoard === 'all') {
        feedHeader.textContent = '최신 게시물';
    } else {
        const boardName = getBoardName(currentBoard);
        feedHeader.textContent = `${boardName} 게시물`;
    }
}

// 게시판별 게시물 수 업데이트
function updateBoardStats() {
    const stats = {
        all: posts.length,
        school1: posts.filter(post => post.board === 'school1').length,
        school2: posts.filter(post => post.board === 'school2').length,
        school3: posts.filter(post => post.board === 'school3').length
    };
    
    boardStats.innerHTML = `
        <div class="stats-item">
            <span class="stats-label">전체:</span>
            <span class="stats-count">${stats.all}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">학교1:</span>
            <span class="stats-count">${stats.school1}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">학교2:</span>
            <span class="stats-count">${stats.school2}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">학교3:</span>
            <span class="stats-count">${stats.school3}</span>
        </div>
    `;
}

// createdAt 포맷 함수
    function formatTimeAgo(ts){
        if (!ts) return '';
        const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
        const diff = (Date.now() - date.getTime()) / 1000; // seconds
        if (diff < 60) return '방금 전';
        if (diff < 3600) return Math.floor(diff/60) + '분 전';
        if (diff < 86400) return Math.floor(diff/3600) + '시간 전';
        const d = Math.floor(diff/86400);
        if (d < 7) return d + '일 전';
        return date.toLocaleString();
        }


        function showSection(id){ [authSection, signupSection, feedSection, writeSection, detailSection, profileSection].forEach(s=>s.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
        function updateNavActive(id){ [navHome, navWrite, navProfile].forEach(n=>n.classList.remove('active')); if(id) document.getElementById(id).classList.add('active'); }
        function showModal(id){ document.getElementById(id).classList.remove('hidden'); }
        function hideModal(id){ document.getElementById(id).classList.add('hidden'); }


        function showFeed(){ showSection('feedSection'); updateNavActive('navHome'); updateBoardSelector(); loadPopularPosts(); loadPosts(); }
        function showWrite(){ if(!currentUser){ showAuth(); return; } showSection('writeSection'); updateNavActive('navWrite'); }
        function showProfile(){ if(!currentUser){ showAuth(); return; } showSection('profileSection'); updateNavActive('navProfile'); loadUserProfile(); masterPanelBtn.classList.toggle('hidden', !isMasterAccount(currentUser)); }
        function showAuth(){ showSection('authSection'); updateNavActive(''); }
        function showPostDetail(id){ currentPostId = id; showSection('detailSection'); loadPostDetail(id); }


        function updateBoardSelector(){ const selector = document.getElementById('boardSelector'); const header = document.querySelector('.feed-header h2'); header.textContent = currentBoard==='all' ? '최신 게시물' : getBoardName(currentBoard) + ' 게시물'; }


        function updateBoardStats(){ const stats = { all: posts.length, school1: posts.filter(p=>p.board==='school1').length, school2: posts.filter(p=>p.board==='school2').length, school3: posts.filter(p=>p.board==='school3').length }; boardStats.innerHTML = `
        <div class="stats-item"><span class="stats-label">전체:</span><span class="stats-count">${stats.all}</span></div>
        <div class="stats-item"><span class="stats-label">학교1:</span><span class="stats-count">${stats.school1}</span></div>
        <div class="stats-item"><span class="stats-label">학교2:</span><span class="stats-count">${stats.school2}</span></div>
        <div class="stats-item"><span class="stats-label">학교3:</span><span class="stats-count">${stats.school3}</span></div>`; }

//  렌더링
function renderPopularPost(post) {
    const postElement = document.createElement('div');
    postElement.className = 'popular-post-card';
    postElement.onclick = () => showPostDetail(post.id);
    const timeAgo = formatTimeAgo(post.createdAt);
    const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);

    
    // 안전하게 닉네임, 학교 표시
    const nickname = post.authorNickname || '익명';
    const school = post.authorschool || '학교 미설정';
    postElement.innerHTML = `
        <div class="popular-post-header">
            <div class="popular-post-author">
                <div class="author-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="author-info">
                    <h4>${nickname}</h4>
                    <p>${school}</p>
                </div>
            </div>
            <div class="popular-post-meta">
                <span class="board-badge">${getBoardName(post.board || 'all')}</span>
                <div class="post-time">${timeAgo}</div>
            </div>
        </div>
        <div class="popular-post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-text">${post.content && post.content.length > 100 ? post.content.substring(0, 100) + '...' : (post.content || '')}</p>
        </div>
        <div class="popular-post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </button>
            <div class="popular-badge">
                <i class="fas fa-fire"></i>
                <span>인기</span>
            </div>
        </div>
    `;
    popularPostsContainer.appendChild(postElement);
}

function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.onclick = () => showPostDetail(post.id);
    
    const timeAgo = formatTimeAgo(post.createdAt);
    const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);
    // 안전하게 닉네임, 학교 표시
    const nickname = post.authorNickname || '익명';
    const school = post.authorschool || '학교 미설정';
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="author-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="author-info">
                    <h4>${nickname}</h4>
                    <p>${school}</p>
                </div>
            </div>
            <div class="post-meta">
                <span class="board-badge">${getBoardName(post.board || 'all')}</span>
                <div class="post-time">${timeAgo}</div>
            </div>
        </div>
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-text">${post.content || ''}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="게시물 이미지" class="post-image">` : ''}
        </div>
        <div class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </button>
            ${(post.authorId === currentUser?.uid || isMasterAccount(currentUser)) ? `
                <button class="delete-btn" onclick="event.stopPropagation(); deletePost('${post.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
    postsContainer.appendChild(postElement);
}

// 게시물 상세 로드 (댓글 관련 코드 제거)
function loadPostDetail(postId) {
    db.collection('posts').doc(postId).onSnapshot((doc) => {
        if (doc.exists) {
            const post = { id: doc.id, ...doc.data() };
            renderPostDetail(post);
        }
    });
}

// 게시물 상세 렌더링 (댓글 영역 제거)
function renderPostDetail(post) {
    const timeAgo = formatTimeAgo(post.createdAt);
    const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);
    const nickname = post.authorNickname || '익명';
    const school = post.authorschool || '학교 미설정';
    postDetail.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="author-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="author-info">
                    <h4>${nickname}</h4>
                    <p>${school}</p>
                </div>
            </div>
            <div class="post-meta">
                <span class="board-badge">${getBoardName(post.board || 'all')}</span>
                <div class="post-time">${timeAgo}</div>
            </div>
        </div>
        <div class="post-content">
            <h1 class="post-title">${post.title}</h1>
            <p class="post-text">${post.content || ''}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="게시물 이미지" class="post-image">` : ''}
        </div>
        <div class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </button>
            ${(post.authorId === currentUser?.uid || isMasterAccount(currentUser)) ? `
                <button class="delete-btn" onclick="deletePost('${post.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
}

// 좋아요 토글
async function toggleLike(postId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const postRef = db.collection('posts').doc(postId);
        const postDoc = await postRef.get();
        const post = postDoc.data();
        
        const likedBy = post.likedBy || [];
        const isLiked = likedBy.includes(currentUser.uid);
        
        if (isLiked) {
            // 좋아요 취소
            await postRef.update({
                likes: firebase.firestore.FieldValue.increment(-1),
                likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
            });
        } else {
            // 좋아요 추가
            await postRef.update({
                likes: firebase.firestore.FieldValue.increment(1),
                likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
        }
    } catch (error) {
        console.error('좋아요 처리 실패:', error);
    }
}

// 검색 기능 (기본 구현)
function searchPosts(query) {
    if (!query.trim()) return;
    
    const filteredPosts = posts.filter(post => {
        const matchesQuery = post.title.toLowerCase().includes(query.toLowerCase()) ||
                           post.content.toLowerCase().includes(query.toLowerCase());
        
        // 현재 선택된 게시판 필터링
        if (currentBoard !== 'all') {
            return matchesQuery && post.board === currentBoard;
        }
        
        return matchesQuery;
    });
    
    // 검색 결과 표시 로직 구현
    console.log('검색 결과:', filteredPosts);
}

// 오프라인 지원을 위한 서비스 워커 등록 (선택사항)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// 게시물 삭제
async function deletePost(postId) {
  if (!currentUser) return;

  // 안전장치 + 확인
  if (!confirm('정말로 이 게시물을 삭제할까요?')) return;

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      alert('게시물이 존재하지 않습니다.');
      return;
    }

    const post = postSnap.data();

    // 권한 체크: 작성자 또는 마스터 계정만 삭제 가능
    const canDelete = (post.authorId === currentUser.uid) || isMasterAccount(currentUser);
    if (!canDelete) {
      alert('삭제 권한이 없습니다.');
      return;
    }

    // 이미지가 있으면 Storage에서도 삭제 (refFromURL 사용)
    if (post.imageUrl) {
      try {
        const imgRef = storage.refFromURL(post.imageUrl);
        await imgRef.delete();
      } catch (e) {
        // 이미지 삭제 실패는 치명적이지 않으므로 로그만
        console.warn('이미지 삭제 중 경고:', e?.message || e);
      }
    }

    await postRef.delete();
    alert('삭제되었습니다.');
    // 목록 갱신
    showFeed();
  } catch (err) {
    console.error('삭제 실패:', err);
    alert('삭제 실패: ' + (err?.message || err));
  }
}

// 프로필 정보 불러오기
async function loadUserProfile() {
    if (!currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        const userData = userDoc.exists ? userDoc.data() : {};

        // profile section uses ids: profileNickname, profileSchool, profileEmail
        const nickEl = document.getElementById('profileNickname');
        const schoolEl = document.getElementById('profileSchool');
        const emailEl = document.getElementById('profileEmail');

        if (nickEl) nickEl.textContent = userData.nickname || '닉네임 미설정';
        if (schoolEl) schoolEl.textContent = userData.school || '학교 미설정';
        if (emailEl) emailEl.textContent = userData.email || currentUser.email;
    } catch (error) {
        console.error('프로필 불러오기 실패:', error);
    }
}


// 인라인 onclick에서 쓸 수 있게 전역으로 노출 (중요)
window.deletePost = deletePost;
