'use client';

import { useState, useRef, useEffect, FormEvent } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { isAdminRole } from "@/lib/roles";

const copy = {
    en: {
        loginTitle: "User Login",
        adminTitle: "Admin Login",
        account: "Account",
        password: "Password",
        loginButton: "Sign in",
        captchaError: "Captcha mismatch. A fresh code was issued.",
        loginOk: "Mock login succeeded. Connect API later.",
        welcomeTitle: "Welcome Back",
        goToWorkspace: "Go to Workspace",
        loggedInAs: "Logged in as",
        modeHintUser: "For hotel operation accounts",
        modeHintAdmin: "For platform administration accounts",
        requestAccess: "Request access",
    },
    zh: {
        loginTitle: "用户登录",
        adminTitle: "管理员登录",
        account: "账号",
        password: "密码",
        loginButton: "登录",
        captchaError: "验证码不匹配，已刷新新验证码。",
        loginOk: "模拟登录成功，后续对接接口。",
        welcomeTitle: "欢迎回来",
        goToWorkspace: "进入工作台",
        loggedInAs: "当前登录",
        modeHintUser: "酒店运营账号入口",
        modeHintAdmin: "平台管理账号入口",
        requestAccess: "申请注册",
    },
};

const regCopy = {
    en: {
        title: "Request access",
        subtitle: "Submit your hotel info to create a regular user account.",
        email: "Email",
        placeholder_email: "you@example.com",
        hotelName: "Hotel name",
        placeholder_hotel: "Hotel ICON",
        employeeId: "Employee ID",
        placeholder_employee: "Staff number",
        password: "Password",
        placeholder_pwd: "At least 6 characters",
        confirm: "Confirm password",
        placeholder_confirm: "Re-enter password",
        captcha: "Captcha",
        placeholder_captcha: "Enter letters above",
        refresh: "Captcha is case-insensitive. Refresh if unclear.",
        submit: "Create demo account",
        back: "Back to login",
        err_fill: "Please complete all fields.",
        err_match: "Passwords do not match.",
        err_captcha: "Captcha mismatch.",
        success: "Demo account created. You can now sign in.",
    },
    zh: {
        title: "申请访问",
        subtitle: "提交酒店信息后创建普通用户账号。",
        email: "邮箱",
        placeholder_email: "you@example.com",
        hotelName: "酒店名称",
        placeholder_hotel: "Hotel ICON",
        employeeId: "员工编号",
        placeholder_employee: "员工编号",
        password: "密码",
        placeholder_pwd: "至少 6 位字符",
        confirm: "确认密码",
        placeholder_confirm: "再次输入密码",
        captcha: "验证码",
        placeholder_captcha: "输入上方字符",
        refresh: "验证码不区分大小写，看不清可刷新。",
        submit: "创建演示账号",
        back: "返回登录",
        err_fill: "请填写所有字段。",
        err_match: "两次输入的密码不一致。",
        err_captcha: "验证码错误。",
        success: "演示账号已创建，可返回登录。",
    },
};

function CaptchaCanvas({ onUpdate }: { onUpdate: (token: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCaptcha = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const token = Array.from({ length: 5 })
            .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)])
            .join("");

        // background
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, 120, 40);

        // noise lines
        for (let i = 0; i < 6; i++) {
            ctx.strokeStyle = `rgba(106,227,255,${0.2 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * 120, Math.random() * 40);
            ctx.lineTo(Math.random() * 120, Math.random() * 40);
            ctx.stroke();
        }

        // text
        ctx.font = "bold 22px Arial";
        ctx.fillStyle = "#6ae3ff";
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        ctx.fillText(token, 12, 28);

        onUpdate(token.toUpperCase());
    };

    useEffect(() => {
        drawCaptcha();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={120}
            height={40}
            onClick={drawCaptcha}
            style={{ cursor: "pointer", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}
            title="Click to refresh captcha"
        />
    );
}

export default function LoginCard() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const tr = regCopy[lang] || regCopy.en;

    // Login State
    const [form, setForm] = useState({ account: "", password: "" });
    const [message, setMessage] = useState("");

    // Register State
    const [isRegistering, setIsRegistering] = useState(false);
    const [loginMode, setLoginMode] = useState<"user" | "admin">("user");
    const [regForm, setRegForm] = useState({ email: '', hotelName: '', employeeId: '', password: '', confirm: '', captchaInput: '' });
    const [captchaToken, setCaptchaToken] = useState('');
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");

        const success = await login(form.account, form.password);
        if (success) {
            router.push(loginMode === "admin" ? '/admin' : '/profile');
        } else {
            setMessage(lang === "en" ? "Invalid credentials" : "账号或密码错误");
        }
    };

    const copyLabel = (key: keyof typeof t) => t[key];

    // If user is logged in, show welcome card
    if (user) {
        return (
            <div className="login-card glass swing-in login-accent">
                <div className="card-head">
                    <div className="pill">{copyLabel("welcomeTitle")}</div>
                    <div className="caption">{user.name || user.account}</div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.7)' }}>
                    <p style={{ marginBottom: 20 }}>{copyLabel("loggedInAs")} <br/><span style={{ color: '#fff', fontWeight: 500 }}>{user.account}</span></p>
                    
                    <button 
                        className="primary-button" 
                        onClick={() => router.push(isAdminRole(user.role) ? '/admin' : '/profile')}
                        style={{ marginBottom: 16 }}
                    >
                        {copyLabel("goToWorkspace")}
                    </button>
                    
                </div>
            </div>
        );
    }

    // Otherwise show login/register form
    return (
        <div className="login-card glass swing-in login-accent">
            {!isRegistering ? (
                <>
                    <div className="card-head">
                        <div className="pill">{loginMode === "admin" ? copyLabel("adminTitle") : copyLabel("loginTitle")}</div>
                        <div className="caption">{loginMode === "admin" ? t.modeHintAdmin : t.modeHintUser}</div>
                    </div>
                    <div className="login-mode-switch">
                        <button
                            type="button"
                            className={`mode-pill ${loginMode === "user" ? "active" : ""}`}
                            onClick={() => setLoginMode("user")}
                        >
                            {copyLabel("loginTitle")}
                        </button>
                        <button
                            type="button"
                            className={`mode-pill ${loginMode === "admin" ? "active" : ""}`}
                            onClick={() => setLoginMode("admin")}
                        >
                            {copyLabel("adminTitle")}
                        </button>
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <label>
                            <span>{copyLabel("account")}</span>
                            <input
                                required
                                type="text"
                                value={form.account}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, account: e.target.value }))
                                }
                                placeholder={loginMode === "admin" ? "admin@example.com" : "hotel_account@example.com"}
                            />
                        </label>
                        <label>
                            <span>{copyLabel("password")}</span>
                            <input
                                required
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, password: e.target.value }))
                                }
                                placeholder="••••••••"
                            />
                        </label>
                        <button className="primary-button" type="submit">
                            {copyLabel("loginButton")}
                        </button>
                    </form>
                    {message && <div className="message">{message}</div>}
                    <div className="admin-toggle">
                        <button
                            type="button"
                            className="nav-text-btn"
                            onClick={() => {
                                setIsRegistering(true);
                                setRegSuccess(false);
                                setRegError('');
                                setRegForm({ email: '', hotelName: '', employeeId: '', password: '', confirm: '', captchaInput: '' });
                            }}
                        >
                            {t.requestAccess}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="card-head" style={{ marginBottom: 24 }}>
                        <p className="pill accent">REGISTRATION</p>
                        <h2>{tr.title}</h2>
                        <p className="muted">{tr.subtitle}</p>
                    </div>

                    {regSuccess ? (
                        <div className="success-message" style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#4ade80', color: '#000', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✓</div>
                            <h3>{tr.success}</h3>
                            <button className="primary-button" style={{ marginTop: 20 }} onClick={() => setIsRegistering(false)}>
                                {tr.back}
                            </button>
                        </div>
                    ) : (
                        <form className="form" onSubmit={async (e) => {
                            e.preventDefault();
                            setRegError('');

                            if (!regForm.email || !regForm.hotelName || !regForm.employeeId || !regForm.password || !regForm.confirm || !regForm.captchaInput) {
                                setRegError(tr.err_fill);
                                return;
                            }
                            if (regForm.password !== regForm.confirm) {
                                setRegError(tr.err_match);
                                return;
                            }
                            if (regForm.captchaInput.toUpperCase() !== captchaToken) {
                                setRegError(tr.err_captcha);
                                return;
                            }

                            try {
                                const res = await fetch('/api/register', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        email: regForm.email,
                                        hotelName: regForm.hotelName,
                                        employeeId: regForm.employeeId,
                                        password: regForm.password
                                    }),
                                });

                                const data = await res.json();
                                if (!res.ok) {
                                    throw new Error(data.message || 'Registration failed');
                                }
                                setRegSuccess(true);
                            } catch (err: any) {
                                setRegError(err.message);
                            }
                        }}>
                            <label>
                                <span>{tr.email}</span>
                                <input
                                    type="email"
                                    placeholder={tr.placeholder_email}
                                    value={regForm.email}
                                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>{tr.hotelName}</span>
                                <input
                                    type="text"
                                    placeholder={tr.placeholder_hotel}
                                    value={regForm.hotelName}
                                    onChange={e => setRegForm({ ...regForm, hotelName: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>{tr.employeeId}</span>
                                <input
                                    type="text"
                                    placeholder={tr.placeholder_employee}
                                    value={regForm.employeeId}
                                    onChange={e => setRegForm({ ...regForm, employeeId: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>{tr.password}</span>
                                <input
                                    type="password"
                                    placeholder={tr.placeholder_pwd}
                                    value={regForm.password}
                                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>{tr.confirm}</span>
                                <input
                                    type="password"
                                    placeholder={tr.placeholder_confirm}
                                    value={regForm.confirm}
                                    onChange={e => setRegForm({ ...regForm, confirm: e.target.value })}
                                />
                            </label>

                            <label>
                                <span>{tr.captcha}</span>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder={tr.placeholder_captcha}
                                        value={regForm.captchaInput}
                                        onChange={e => setRegForm({ ...regForm, captchaInput: e.target.value })}
                                        style={{ flex: 1, minWidth: 0, textTransform: 'uppercase' }}
                                    />
                                    <CaptchaCanvas onUpdate={setCaptchaToken} />
                                </div>
                                <p className="muted tiny" style={{ marginTop: 4 }}>{tr.refresh}</p>
                            </label>

                            <button className="primary-button" type="submit">
                                {tr.submit}
                            </button>
                            {regError && <div className="message error" style={{ color: '#ff6b6b' }}>{regError}</div>}

                            <div className="admin-toggle">
                                <button type="button" className="nav-text-btn" onClick={() => setIsRegistering(false)}>
                                    {tr.back}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
