import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const useAuthTimeout = (user, timeoutDuration = 60 * 60 * 1000) => { 
    const timeoutRef = useRef(null);
    const warningTimeoutRef = useRef(null);

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('loginTime');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const showWarning = () => {
        const confirmStay = window.confirm(
            'A sua sessão irá expirar em 5 minutos. Deseja continuar ligado?'
        );
        
        if (confirmStay) {
            resetTimeout(); // Resetar timeout se o utilizador quiser continuar
        }
    };

    const resetTimeout = () => {
        // Limpar timeouts existentes
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        if (user) {
            // Guardar tempo de login
            localStorage.setItem('loginTime', Date.now().toString());

            // Aviso 5 minutos antes de expirar
            warningTimeoutRef.current = setTimeout(showWarning, timeoutDuration - 5 * 60 * 1000);

            // Logout automático após timeout
            timeoutRef.current = setTimeout(() => {
                alert('Sessão expirou!');
                logout();
            }, timeoutDuration);
        }
    };

    const checkExistingSession = () => {
        const loginTime = localStorage.getItem('loginTime');
        
        if (loginTime && user) {
            const timeElapsed = Date.now() - parseInt(loginTime);
            
            if (timeElapsed >= timeoutDuration) {
                logout();
                return;
            }

            // Calcular tempo restante
            const remainingTime = timeoutDuration - timeElapsed;
            const warningTime = remainingTime - 5 * 60 * 1000; // 5 minutos antes

            // Se já passou do tempo de aviso, mostrar aviso imediatamente
            if (warningTime <= 0) {
                showWarning();
            } else {
                // Configurar timers com tempo restante
                warningTimeoutRef.current = setTimeout(showWarning, warningTime);
                timeoutRef.current = setTimeout(() => {
                    alert('Sessão expirou!');
                    logout();
                }, remainingTime);
            }
        }
    };

    useEffect(() => {
        if (user) {
            checkExistingSession();

            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            
            events.forEach(event => {
                document.addEventListener(event, resetTimeout, true);
            });

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, resetTimeout, true);
                });
            };
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [user]);

    return { resetTimeout };
};

export default useAuthTimeout;