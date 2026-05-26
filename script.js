/* ==========================================================================
   AGENCY SURVIVAL — THT EDITION: CLEAN Y2K CONTROLLER (VANILLA JS)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. GAME STATE
    // ==========================================================================
    
    const STATE = {
        score: 0,
        timer: 90,
        combo: 1,
        synergy: 80, // Stability (S)
        results: 80, // Impacto (I)
        client: 80,  // Cliente (C)
        currentLevel: 1,
        selectedTeam: null,
        totalDecisions: 0,
        correctDecisions: 0,
        gameActive: false,
        levelActive: false,
        timerInterval: null,
        soundEnabled: true,
        collapsed: false // Single-Life collapse flag
    };

    const SQUADS = {
        Team1: { name: "TEAM 01", bonus: "none", desc: "Comunicación: Eliminamos la ambigüedad y el silencio. Compartimos información crítica porque el talento individual suma, pero el equipo alineado multiplica." },
        Team2: { name: "TEAM 02", bonus: "none", desc: "Sinergia: Jugamos conectados. Integramos talentos para que el trabajo de uno mejore el resultado del otro." },
        Team3: { name: "TEAM 03", bonus: "none", desc: "Equipo Estrella: No buscamos un grupo de estrellas que brillen solas; somos un equipo estrella que empuja hacia el mismo resultado." }
    };

    const LEVEL1_CHATS = {
        Team1: {
            channel: "comunicación-en-acción",
            desc: "Peligro del silencio, la ambigüedad y la falta de acuerdos claros",
            messages: [
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "¿Alguien vio el reporte de métricas mensuales que pidió el Director? Lo necesito en 10 minutos.", time: "11:50", isLeft: true },
                { sender: "Ro", role: "Pauta", roleClass: "sender-role-squad", avatar: "Ro", avatarClass: "green-avatar", text: "Yo lo armé a medias, pero faltan los datos finales de pauta porque Lu no me los pasó.", time: "11:51", isLeft: false },
                { sender: "Lu", role: "Código", roleClass: "sender-role-squad", avatar: "Lu", avatarClass: "violet-avatar", text: "Es que nadie me avisó que los necesitaban hoy, yo los estaba procesando para el viernes...", time: "11:52", isLeft: false },
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "🔴 Chicos, el Director entra a la reunión YA. Resuelvan y pásenme algo estructurado.", time: "11:53", isLeft: true, isUrgent: true }
            ],
            options: {
                A: "Armar un reporte improvisado con datos estimados en silencio para cumplir con el tiempo, cruzando los dedos para que el Director no note los desvíos.",
                B: "Seguir discutiendo en el chat para definir de quién fue la culpa por no avisar antes, dejando al cliente interno sin ninguna respuesta.",
                C: "Levantar la mano con honestidad: Ro y Lu unifican rápido lo que tienen, MG presenta los datos reales validados y fijan un acuerdo claro con hora exacta para entregar el resto."
            },
            feedbacks: {
                A: "🔴 Armar reportes improvisados atenta contra la Impecabilidad. Ocultar desvíos destruye la confianza. ¡La honestidad es primera condición!",
                B: "⚠️ Buscar culpables en medio de la crisis paraliza al equipo y deja al cliente interno desatendido. ¡Enfóquense en resolver colectivamente!",
                C: "¡Excelente decisión! Levantar la mano con honestidad, unificar lo real y acordar una entrega formal cuida la relación y demuestra Impecabilidad."
            },
            correctAnswer: "C"
        },
        Team2: {
            channel: "sinergia-conectada",
            desc: "La desconexión del sistema y cómo el trabajo aislado genera fricción",
            messages: [
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "El cliente de la campaña de leads dice que el sitio web está dando error al cargar el formulario.", time: "16:10", isLeft: true },
                { sender: "Ro", role: "Pauta", roleClass: "sender-role-squad", avatar: "Ro", avatarClass: "green-avatar", text: "Desde pauta las campañas están corriendo perfecto y trayendo clics, el problema es de código.", time: "16:11", isLeft: false },
                { sender: "Lu", role: "Código", roleClass: "sender-role-squad", avatar: "Lu", avatarClass: "violet-avatar", text: "Yo modifiqué el formulario ayer porque Estrategia me pidió un cambio de campos de último momento. No sabía que afectaba la campaña.", time: "16:12", isLeft: false },
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "🔴 El cliente está viendo que los clics no convierten. Hay que arreglar esto ahora.", time: "16:13", isLeft: true, isUrgent: true }
            ],
            options: {
                A: "Actuar como un sistema conectado: Lu revierte el cambio técnico en caliente para restablecer el formulario mientras Ro monitorea el flujo de clics, asegurando que el trabajo de una mejore el resultado de la otra.",
                B: "Frenar absolutamente todas las campañas de forma masiva y armar una reunión de emergencia con todo el equipo para opinar sobre el diseño del formulario.",
                C: "Que cada área defienda su tarea de forma aislada: Ro sigue corriendo pauta para cumplir su KPI y Lu revisa el código sola cuando termine sus otros pendientes."
            },
            feedbacks: {
                A: "¡Sinergia pura! Revertir el error técnico y monitorear el tráfico en tiempo real asegura que el trabajo de uno potencie el de la otra.",
                B: "⚠️ Parar todo y debatir en un comité masivo genera parálisis por análisis. ¡Se necesita acción coordinada e inmediata!",
                C: "🔴 Trabajar en silos persiguiendo KPIs individuales daña el resultado global. ¡El sistema debe funcionar conectado!"
            },
            correctAnswer: "A"
        },
        Team3: {
            channel: "equipo-estrella",
            desc: "Orientación a resultados y valor real vs cumplir tareas mecánicamente",
            messages: [
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "El cliente nos reclama que el volumen de ventas bajó este mes y exige que dupliquemos las publicaciones en redes sociales.", time: "10:30", isLeft: true },
                { sender: "Ro", role: "Pauta", roleClass: "sender-role-squad", avatar: "Ro", avatarClass: "green-avatar", text: "Yo puedo programar el doble de contenidos sin problema, ya tengo las plantillas listas.", time: "10:31", isLeft: false },
                { sender: "Lu", role: "Código", roleClass: "sender-role-squad", avatar: "Lu", avatarClass: "violet-avatar", text: "Cumplir con esa cantidad va a saturar el canal de contenido operativo y no va a solucionar la baja de ventas del cliente.", time: "10:32", isLeft: false },
                { sender: "MG", role: "Cliente", roleClass: "sender-role-client", avatar: "MG", avatarClass: "red-avatar", text: "🔴 El cliente está presionando mucho. Pide una acción concreta ahora.", time: "10:33", isLeft: true, isUrgent: true }
            ],
            options: {
                A: "Publicar mecánicamente todo el contenido extra que pide el cliente para cerrar el ticket rápido y demostrar que cumplimos con la tarea solicitada.",
                B: "Foco en mover la aguja: el equipo frena la urgencia vacía y le presenta al cliente una contrapropuesta basada en performance, demostrando cómo una acción coordinada generará el resultado real de negocio que busca.",
                C: "Rechazar la petición del cliente de manera tajante argumentando que su estrategia está equivocada, sin proponer ninguna alternativa medible."
            },
            feedbacks: {
                A: "🔴 Cumplir tareas vacías solo para 'cerrar el ticket' atenta contra la Orientación a Resultados. ¡No es hacer más, es mover la aguja!",
                B: "¡Soberbia orientación a resultados! Frenar la urgencia sin valor y co-crear una contrapropuesta de negocio es lo que define a un Equipo Estrella.",
                C: "⚠️ Decir un no rotundo sin proponer una alternativa deja al cliente frustrado. El rol del equipo es guiar al cliente hacia el impacto real."
            },
            correctAnswer: "B"
        }
    };

    const LEVEL2_DATA = {
        Team1: {
            instruction: "Arrastrá a ZONA DE IMPACTO solo las acciones que erradican la ambigüedad y construyen confianza.",
            meta: "META: LOGRAR UN SISTEMA DE PROMESAS IMPECABLE",
            tasks: [
                { id: "tk1", text: "Avisar un desvío técnico o retraso a tiempo", isGood: true, dotColor: "grey" },
                { id: "tk2", text: "Pedir claridad absoluta antes de avanzar", isGood: true, dotColor: "grey" },
                { id: "tk3", text: "Definir fecha y hora exacta de entrega", isGood: true, dotColor: "grey" },
                { id: "tk4", text: "Reconocer un incumplimiento y proponer solución", isGood: true, dotColor: "grey" },
                { id: "tk5", text: "Aceptar tareas sin tener los recursos claros", isGood: false, dotColor: "grey" },
                { id: "tk6", text: "Ocultar un retraso por temor a molestar", isGood: false, dotColor: "grey" },
                { id: "tk7", text: "Dar respuestas ambiguas para ganar tiempo", isGood: false, dotColor: "grey" },
                { id: "tk8", text: "Asumir en silencio que el otro ya entendió", isGood: false, dotColor: "grey" }
            ]
        },
        Team2: {
            instruction: "El cliente pide un cambio urgente en la web. Arrastrá a ZONA DE IMPACTO solo las acciones que activan la sinergia entre áreas.",
            meta: "META: INTEGRAR EL SISTEMA QUE GANA",
            tasks: [
                { id: "tk1", text: "KAM: Tomar el pedido del cliente e informar al PM", isGood: true, dotColor: "grey" },
                { id: "tk2", text: "PM: Elevar la prioridad a los líderes de área", isGood: true, dotColor: "grey" },
                { id: "tk3", text: "Líderes de Área: Coordinar la implementación en tiempo y forma", isGood: true, dotColor: "grey" },
                { id: "tk4", text: "KAM: Notificar al cliente la resolución exitosa", isGood: true, dotColor: "grey" },
                { id: "tk5", text: "KAM: Prometer la entrega inmediata sin consultar capacidad", isGood: false, dotColor: "grey" },
                { id: "tk6", text: "PM: Presionar a producción sin dar contexto del pedido", isGood: false, dotColor: "grey" },
                { id: "tk7", text: "Líderes: Resolver a ciegas descuidando el resto de las áreas", isGood: false, dotColor: "grey" },
                { id: "tk8", text: "Todas las áreas: Avanzar por separado cuidando el beneficio individual", isGood: false, dotColor: "grey" }
            ]
        },
        Team3: {
            instruction: "Arrastrá a ZONA DE IMPACTO solo las tareas estratégicas que verdaderamente mueven la aguja.",
            meta: "META: ALCANZAR EL LOGRO COLECTIVO (+25% Leads Calificados)",
            tasks: [
                { id: "tk1", text: "Optimizar la landing page de conversión", isGood: true, dotColor: "grey" },
                { id: "tk2", text: "Estructurar el formulario de captación de leads", isGood: true, dotColor: "grey" },
                { id: "tk3", text: "Segmentar la campaña de Search estratégica", isGood: true, dotColor: "grey" },
                { id: "tk4", text: "Automatizar el email nurturing para madurar leads", isGood: true, dotColor: "grey" },
                { id: "tk5", text: "Publicar reels genéricos sin objetivo comercial", isGood: false, dotColor: "grey" },
                { id: "tk6", text: "Completar reportes operativos de nulo impacto", isGood: false, dotColor: "grey" },
                { id: "tk7", text: "Sumar tareas mecánicas solo para parecer ocupados", isGood: false, dotColor: "grey" },
                { id: "tk8", text: "Rediseñar banners basados solo en opiniones", isGood: false, dotColor: "grey" }
            ]
        }
    };

    // ==========================================================================
    // 2. RETRO AUDIO SYNTHESIS ENGINE (Web Audio API)
    // ==========================================================================
    
    class AudioEngine {
        constructor() {
            this.ctx = null;
            this.bpm = 135; // Upbeat and cheerful tempo
            this.sequencerTimer = null;
            this.isPlayingMusic = false;
            this.step = 0;
            
            // Cheerful major retro bassline (C3, F3, G3, C4)
            this.bassline = [
                130.81, 130.81, 164.81, 164.81, // C3, E3 (C major feel)
                174.61, 174.61, 220.00, 220.00, // F3, A3 (F major feel)
                196.00, 196.00, 246.94, 246.94, // G3, B3 (G major feel)
                261.63, 261.63, 196.00, 130.81  // C4, G3, C3 (Cheerful resolution)
            ];
            
            // Playful major arpeggiator melody
            this.leadMelody = [
                261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5 (C Major Arpeggio)
                349.23, 440.00, 523.25, 698.46, // F4, A4, C5, F5 (F Major Arpeggio)
                392.00, 493.88, 587.33, 783.99, // G4, B4, D5, G5 (G Major Arpeggio)
                523.25, 392.00, 329.63, 261.63  // C5, G4, E4, C4 (Downward run)
            ];
        }

        init() {
            if (this.ctx) return;
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
        }

        startMusic() {
            if (!STATE.soundEnabled || this.isPlayingMusic) return;
            this.init();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.isPlayingMusic = true;
            this.step = 0;
            
            const stepDuration = 60 / this.bpm / 2; // Eighth notes
            let nextStepTime = this.ctx.currentTime;

            const scheduler = () => {
                while (nextStepTime < this.ctx.currentTime + 0.1) {
                    this.playSynthwaveStep(nextStepTime);
                    nextStepTime += stepDuration;
                }
                this.sequencerTimer = setTimeout(scheduler, 25);
            };
            scheduler();
        }

        stopMusic() {
            if (this.sequencerTimer) {
                clearTimeout(this.sequencerTimer);
                this.sequencerTimer = null;
            }
            this.isPlayingMusic = false;
        }

        playSynthwaveStep(time) {
            if (!this.ctx || this.ctx.state === 'suspended') return;
            
            const stepIndex = this.step % 16;
            
            // 1. BASS SYNTH (Sawtooth wave for deep retro sub-bass)
            const bassFrequency = this.bassline[this.step % this.bassline.length];
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            const bassFilter = this.ctx.createBiquadFilter();
            
            bassOsc.type = "sawtooth";
            bassOsc.frequency.setValueAtTime(bassFrequency, time);
            
            bassGain.gain.setValueAtTime(0.08, time);
            bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
            
            bassFilter.type = "lowpass";
            bassFilter.frequency.setValueAtTime(220, time);
            bassFilter.frequency.exponentialRampToValueAtTime(80, time + 0.2);

            bassOsc.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            
            bassOsc.start(time);
            bassOsc.stop(time + 0.24);

            // 2. SYNTH SNARE/PERCUSSION (Noise burst on beats 4, 8, 12, 16)
            if (stepIndex % 4 === 2) {
                this.playSynthesizedSnare(time);
            }

            // 3. RETRO CHIPTUNE HI-HAT (Short metal ticks on off-beats)
            if (stepIndex % 2 === 1) {
                const tickOsc = this.ctx.createOscillator();
                const tickGain = this.ctx.createGain();
                
                tickOsc.type = "triangle";
                tickOsc.frequency.setValueAtTime(8000, time);
                
                tickGain.gain.setValueAtTime(0.01, time);
                tickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
                
                tickOsc.connect(tickGain);
                tickGain.connect(this.ctx.destination);
                
                tickOsc.start(time);
                tickOsc.stop(time + 0.05);
            }

            // 4. RETRO LEAD ARPEGGIATOR (Bouncy playful background melody)
            if (stepIndex % 2 === 0) {
                const leadFreq = this.leadMelody[this.step % this.leadMelody.length];
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                
                leadOsc.type = "triangle"; // Soft, round, woodwind-like retro tone
                leadOsc.frequency.setValueAtTime(leadFreq, time);
                
                leadGain.gain.setValueAtTime(0.012, time); // Low volume, elegant background atmosphere
                leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
                
                leadOsc.connect(leadGain);
                leadGain.connect(this.ctx.destination);
                
                leadOsc.start(time);
                leadOsc.stop(time + 0.15);
            }

            this.step++;
        }

        playSynthesizedSnare(time) {
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(900, time);
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.04, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            
            noise.start(time);
            noise.stop(time + 0.12);
        }

        playBleep() {
            if (!STATE.soundEnabled) return;
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(450, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        }

        playCorrect() {
            if (!STATE.soundEnabled) return;
            this.init();
            const now = this.ctx.currentTime;
            
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                
                gain.gain.setValueAtTime(0.05, now + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.12);
            });
        }

        playIncorrect() {
            if (!STATE.soundEnabled) return;
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = "triangle";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.2);
            
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.2);
        }

        playCatch() {
            if (!STATE.soundEnabled) return;
            this.init();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.setValueAtTime(1200, now + 0.06);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.15);
        }

        playCombo() {
            if (!STATE.soundEnabled) return;
            this.init();
            const now = this.ctx.currentTime;
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.exponentialRampToValueAtTime(1479.98, now + 0.1);
            
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.1);
        }

        playVictoryFanfare() {
            if (!STATE.soundEnabled) return;
            this.init();
            const now = this.ctx.currentTime;
            
            // Arcade Major arpeggio C4, E4, G4, C5, G5
            const frequencies = [261.63, 329.63, 392.00, 523.25, 783.99];
            
            frequencies.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = "square";
                osc.frequency.setValueAtTime(freq, now + (idx * 0.12));
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.setValueAtTime(0.04, now + (idx * 0.12));
                gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.12) + 0.4);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + (idx * 0.12));
                osc.stop(now + (idx * 0.12) + 0.4);
            });
        }

        playAlarm() {
            // Quiet warning: Muted as requested to keep the retro gameplay clean and focus-oriented
            return;
        }
    }

    const AUDIO = new AudioEngine();

    // ==========================================================================
    // 3. BACKGROUND CANVAS PARTICLE SYSTEM (CYBER-GREEN RETRO FLAT)
    // ==========================================================================
    
    class AmbientParticles {
        constructor() {
            this.canvas = document.getElementById("ambient-particles");
            this.ctx = this.canvas.getContext("2d");
            this.particles = [];
            this.maxParticles = 30;
            
            this.resize();
            window.addEventListener("resize", () => this.resize());
            
            for (let i = 0; i < this.maxParticles; i++) {
                this.particles.push(this.createParticle(true));
            }
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticle(randomY = false) {
            return {
                x: Math.random() * this.canvas.width,
                y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
                speed: 0.3 + Math.random() * 0.8,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.75 ? "rgba(123, 92, 255, 0.15)" : "rgba(13, 204, 103, 0.15)",
                pulseSpeed: 0.01 + Math.random() * 0.015,
                pulse: Math.random()
            };
        }

        update() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "rgba(11, 16, 32, 0.96)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p, idx) => {
                p.y -= p.speed;
                p.pulse += p.pulseSpeed;
                
                const alpha = 0.05 + Math.abs(Math.sin(p.pulse)) * 0.25;
                this.ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha.toFixed(2)})`);
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
                
                if (p.y < -10) {
                    this.particles[idx] = this.createParticle(false);
                }
            });
        }
    }

    const PARTICLES = new AmbientParticles();
    
    function animationLoop() {
        PARTICLES.update();
        requestAnimationFrame(animationLoop);
    }
    animationLoop();

    // ==========================================================================
    // 4. UI ELEMENT CACHING & CONTROLLER
    // ==========================================================================
    
    const SCREENS = {
        intro: document.getElementById("screen-intro"),
        squad: document.getElementById("screen-squad-select"),
        levelSelect: document.getElementById("screen-level-select"),
        gameplay: document.getElementById("screen-gameplay"),
        results: document.getElementById("screen-results")
    };

    const HUD = {
        wrapper: document.getElementById("hud"),
        squad: document.getElementById("hud-squad-val"),
        score: document.getElementById("hud-score-val"),
        combo: document.getElementById("hud-combo-val"),
        timer: document.getElementById("hud-timer-val"),
        barSynergy: document.getElementById("bar-synergy"),
        barResults: document.getElementById("bar-results"),
        barClient: document.getElementById("bar-client")
    };

    const HELPER_BOT = {
        wrapper: document.getElementById("robot-helper"),
        text: document.getElementById("robot-bubble-text"),
        close: document.getElementById("btn-close-robot"),
        tips: [
            "Pensá impacto, no volumen.",
            "¿Ya avisaste al equipo del desvío?",
            "El cliente siente la desalineación interna.",
            "Eso parece urgente… ¿pero mueve el KPI?",
            "La sinergia se construye en cada pase.",
            "El cliente no compra tareas internas.",
            "El talento individual suma. El equipo alineado multiplica.",
            "No es terminar tareas. Es mover la aguja.",
            "Trabajar conectados es resolver temprano."
        ],
        motivationalQuotes: [
            "¡Casi! Recordá: 'No es hacer más, es generar impacto.' ¡Probemos otra vez!",
            "¡No te preocupes! El desvío es una oportunidad de alertar a tiempo y salvar la Sinergia. ¡Sigamos conectados!",
            "¡Buen intento! Mapear la sinergia requiere pases constantes y paciencia. ¡Vos podés!",
            "¡Casi la tenés! Sin alineación, el resultado se rompe, pero con coordinación todo se recupera. ¡Dale!",
            "¡No pasa nada! Pensar impacto requiere práctica. ¡Analicemos de nuevo las prioridades!"
        ]
    };

    function showScreen(screenKey) {
        Object.keys(SCREENS).forEach(key => {
            if (key === screenKey) {
                SCREENS[key].classList.remove("hidden");
                SCREENS[key].classList.add("screen-fade-in");
            } else {
                SCREENS[key].classList.add("hidden");
            }
        });
        
        if (screenKey === "gameplay") {
            HUD.wrapper.classList.remove("hidden");
        } else {
            HUD.wrapper.classList.add("hidden");
        }
        
        triggerRobot(false);
    }

    function triggerScreenShake() {
        const container = document.getElementById("game-container");
        container.classList.add("screen-shake");
        setTimeout(() => {
            container.classList.remove("screen-shake");
        }, 200);
    }

    function updateHUD() {
        HUD.score.textContent = String(STATE.score).padStart(4, "0");
        HUD.combo.textContent = `x${STATE.combo}`;
        HUD.timer.textContent = STATE.timer;
        
        STATE.synergy = Math.max(10, Math.min(100, STATE.synergy));
        STATE.results = Math.max(10, Math.min(100, STATE.results));
        STATE.client = Math.max(10, Math.min(100, STATE.client));
        
        HUD.barSynergy.style.width = `${STATE.synergy}%`;
        HUD.barResults.style.width = `${STATE.results}%`;
        HUD.barClient.style.width = `${STATE.client}%`;
        
        toggleDangerClass(HUD.barSynergy, STATE.synergy);
        toggleDangerClass(HUD.barResults, STATE.results);
        toggleDangerClass(HUD.barClient, STATE.client);
    }

    function toggleDangerClass(element, value) {
        if (value <= 35) {
            element.classList.add("in-danger");
        } else {
            element.classList.remove("in-danger");
        }
    }

    let robotTimeout = null;
    function triggerRobot(visible, customText = null, isError = false) {
        if (robotTimeout) clearTimeout(robotTimeout);
        if (visible) {
            let randomTip = customText;
            if (!randomTip) {
                randomTip = isError 
                    ? HELPER_BOT.motivationalQuotes[Math.floor(Math.random() * HELPER_BOT.motivationalQuotes.length)]
                    : HELPER_BOT.tips[Math.floor(Math.random() * HELPER_BOT.tips.length)];
            }
            HELPER_BOT.text.textContent = randomTip;
            HELPER_BOT.wrapper.className = "robot-visible";
            
            // Auto-hide robot after 3.5 seconds
            robotTimeout = setTimeout(() => {
                HELPER_BOT.wrapper.className = "robot-hidden";
            }, 3500);
        } else {
            HELPER_BOT.wrapper.className = "robot-hidden";
        }
    }

    HELPER_BOT.close.addEventListener("click", () => triggerRobot(false));

    // ==========================================================================
    // 5. INTRO SCREEN MODULE
    // ==========================================================================
    
    const btnStartGame = document.getElementById("btn-start-game");
    const audioToggle = document.getElementById("audio-toggle");
    const introLoading = document.getElementById("intro-loading");

    btnStartGame.addEventListener("click", () => {
        STATE.soundEnabled = audioToggle.checked;
        AUDIO.playBleep();
        
        btnStartGame.classList.add("hidden");
        introLoading.classList.remove("hidden");
        
        setTimeout(() => {
            if (STATE.soundEnabled) {
                AUDIO.startMusic();
            }
            showScreen("squad");
            AUDIO.playCorrect();
        }, 2100);
    });

    const audioUnlockOverlay = document.getElementById("audio-unlock-overlay");
    const btnUnlockAudio = document.getElementById("btn-unlock-audio");
    
    function checkAudioContext() {
        if (STATE.soundEnabled && AUDIO.ctx && AUDIO.ctx.state === 'suspended') {
            audioUnlockOverlay.classList.remove("hidden");
        }
    }

    btnUnlockAudio.addEventListener("click", () => {
        if (AUDIO.ctx) {
            AUDIO.ctx.resume();
        }
        audioUnlockOverlay.classList.add("hidden");
        AUDIO.playCorrect();
    });

    // ==========================================================================
    // 6. SQUAD SELECTION MODULE
    // ==========================================================================
    
    const squadCards = document.querySelectorAll(".squad-card");
    const btnConfirmSquad = document.getElementById("btn-confirm-squad");

    squadCards.forEach(card => {
        card.addEventListener("click", () => {
            squadCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            
            const selected = card.getAttribute("data-squad");
            STATE.selectedTeam = selected;
            HUD.squad.textContent = SQUADS[selected].name;
            
            AUDIO.playBleep();
            
            btnConfirmSquad.classList.remove("locked");
            btnConfirmSquad.removeAttribute("disabled");
        });
    });

    btnConfirmSquad.addEventListener("click", () => {
        AUDIO.playCorrect();
        updateHUD();
        showScreen("levelSelect");
    });

    // ==========================================================================
    // 7. LEVEL SELECT MAP MODULE
    // ==========================================================================
    
    const levelNodes = document.querySelectorAll(".level-node");
    const btnStartLevel = document.getElementById("btn-start-level");
    const btnBackSquad = document.getElementById("btn-back-squad");
    
    let activeSelectedLevel = 1;

    levelNodes.forEach(node => {
        node.addEventListener("click", () => {
            if (node.classList.contains("locked") || node.classList.contains("completed")) {
                AUDIO.playIncorrect();
                return;
            }
            
            levelNodes.forEach(n => n.classList.remove("selected"));
            node.classList.add("selected");
            
            activeSelectedLevel = parseInt(node.getAttribute("data-level"));
            AUDIO.playBleep();
            
            btnStartLevel.classList.remove("locked");
            btnStartLevel.removeAttribute("disabled");
        });
    });

    btnBackSquad.addEventListener("click", () => {
        AUDIO.playBleep();
        showScreen("squad");
    });

    // ==========================================================================
    // 8. GAMEPLAY TIMERS & BRIEFING
    // ==========================================================================
    
    const levelIntroOverlay = document.getElementById("level-intro-overlay");
    const lvlIntroTitle = document.getElementById("lvl-intro-title");
    const lvlIntroDesc = document.getElementById("lvl-intro-desc");
    const lvlIntroRules = document.getElementById("lvl-intro-rules");
    const btnStartLevelAction = document.getElementById("btn-start-level-action");

    const minigames = {
        1: document.getElementById("minigame-feedback-rush"),
        2: document.getElementById("minigame-crisis-priority"),
        3: document.getElementById("minigame-kpi-catcher")
    };

    const LEVEL_METADATA = {
        1: {
            tagTop: "THT MISSION BRIEF",
            title: "NIVEL 1: FEEDBACK RUSH",
            desc: "El cliente ve el resultado de nuestra coordinación. Resolvé la crisis eliminando la ambigüedad y la fricción interna.",
            rules: [
                "Leé los dilemas y erradicá el silencio.",
                "Elegí la opción que asegure una promesa impecable en menos de 40 segundos.",
                "Los errores cortan la jugada. Synapse-Bot alertará tus desvíos a tiempo."
            ]
        },
        2: {
            tagTop: "THT MISSION BRIEF",
            title: "NIVEL 2: KPI CHAOS",
            desc: "Priorización de impacto en negocio. Aprendé a separar el esfuerzo diario del ruido operativo para dirigir la energía hacia el valor medible.",
            rules: [
                "Arrastrá a la ZONA DE IMPACTO las acciones que verdaderamente mueven la aguja.",
                "Mantené el foco estratégico para alcanzar la META.",
                "Dejá a la izquierda las tareas sin propósito claro que debilitan el resultado del sistema."
            ]
        },
        3: {
            tagTop: "THT CRITICAL BRIEF",
            title: "NIVEL 3: KPI CATCHER",
            desc: "Foco extremo en performance. Capturá los resultados reales que mueven la aguja y esquivá las falsas urgencias que consumen la energía del sistema.",
            rules: [
                "Atrapá los impactos reales antes de que toquen el suelo.",
                "Esquivá el ruido operativo y las tareas sin propósito.",
                "Cada acierto multiplica tu performance. El retrabajo destruye tus métricas."
            ]
        }
    };

    btnStartLevel.addEventListener("click", () => {
        AUDIO.playCorrect();
        showScreen("gameplay");
        
        const meta = LEVEL_METADATA[activeSelectedLevel];
        document.querySelector(".level-tag-top").textContent = meta.tagTop;
        lvlIntroTitle.textContent = meta.title;
        lvlIntroDesc.textContent = meta.desc;
        lvlIntroRules.innerHTML = "";
        meta.rules.forEach(rule => {
            const li = document.createElement("li");
            li.textContent = rule;
            lvlIntroRules.appendChild(li);
        });
        
        levelIntroOverlay.classList.remove("hidden");
    });

    btnStartLevelAction.addEventListener("click", () => {
        AUDIO.playBleep();
        levelIntroOverlay.classList.add("hidden");
        checkAudioContext();
        
        startMinigame(activeSelectedLevel);
    });

    function startMinigame(levelNum) {
        STATE.currentLevel = levelNum;
        STATE.gameActive = true;
        STATE.levelActive = true;
        STATE.collapsed = false;
        
        STATE.timer = 40;
        
        updateHUD();
        
        Object.keys(minigames).forEach(num => {
            if (parseInt(num) === levelNum) {
                minigames[num].classList.remove("hidden");
            } else {
                minigames[num].classList.add("hidden");
            }
        });

        if (levelNum === 1) initLevel1();
        else if (levelNum === 2) initLevel2();
        else if (levelNum === 3) initLevel3();

        clearInterval(STATE.timerInterval);
        STATE.timerInterval = setInterval(() => {
            if (STATE.levelActive) {
                STATE.timer--;
                
                if (STATE.timer <= 10 && STATE.timer > 0) {
                    AUDIO.playAlarm();
                    HUD.timer.classList.add("neon-pulse");
                } else {
                    HUD.timer.classList.remove("neon-pulse");
                }
                
                updateHUD();
                
                if (STATE.timer <= 0) {
                    endLevel(true, "Se agotó el tiempo. Registrando métricas...");
                }
            }
        }, 1000);
    }

    function endLevel(success, message = "") {
        STATE.levelActive = false;
        clearInterval(STATE.timerInterval);
        
        if (success) {
            AUDIO.playCorrect();
            
            const recoveries = [
                "El equipo reaccionó alineado.",
                "La coordinación salvó el resultado.",
                "Impacto protegido.",
                "Sinergia restaurada.",
                "Objetivo recuperado."
            ];
            const recPhrase = recoveries[Math.floor(Math.random() * recoveries.length)];
            triggerRobot(true, `👍 ${recPhrase} ${message}`);
            
            setTimeout(() => {
                if (STATE.currentLevel < 3) {
                    const currNode = document.getElementById(`level-node-${STATE.currentLevel}`);
                    currNode.classList.add("completed");
                    currNode.classList.remove("active");
                    currNode.querySelector(".level-status-tag").textContent = "COMPLETADO";

                    const nextNum = STATE.currentLevel + 1;
                    const nextNode = document.getElementById(`level-node-${nextNum}`);
                    nextNode.classList.remove("locked");
                    nextNode.classList.add("active");
                    nextNode.querySelector(".level-status-tag").textContent = "DISPONIBLE";
                    // Preseleccionar automáticamente el siguiente nivel
                    levelNodes.forEach(n => n.classList.remove("selected"));
                    nextNode.classList.add("selected");
                    activeSelectedLevel = nextNum;
                    btnStartLevel.classList.remove("locked");
                    btnStartLevel.removeAttribute("disabled");
                    
                    showScreen("levelSelect");
                } else {
                    showResultsScreen();
                }
            }, 3000);
        } else {
            triggerSupportiveRetryOverlay();
        }
    }

    function triggerSupportiveRetryOverlay() {
        const overlay = document.getElementById("level-retry-overlay");
        if (overlay) {
            overlay.classList.remove("hidden");
        }
        
        const btnRetry = document.getElementById("btn-retry-level-action");
        if (btnRetry) {
            btnRetry.onclick = () => {
                overlay.classList.add("hidden");
                // Restore bars to safe Y2K 80% to keep game playable and amical
                STATE.synergy = 80;
                STATE.results = 80;
                STATE.client = 80;
                updateHUD();
                
                // Restart current level minigame
                startMinigame(STATE.currentLevel);
            };
        }
    }

    // ==========================================================================
    // 9. MINIJUEGO 1 — FEEDBACK RUSH
    // ==========================================================================
    
    function initLevel1() {
        const teamChat = LEVEL1_CHATS[STATE.selectedTeam || "Team1"];
        
        // Update header details
        const chTitle = document.getElementById("chat-channel-title");
        const chDesc = document.getElementById("chat-channel-desc");
        if (chTitle) chTitle.textContent = teamChat.channel;
        if (chDesc) chDesc.textContent = teamChat.desc;

        // Clear chat scroll list
        const scrollList = document.getElementById("chat-history-list");
        if (scrollList) scrollList.innerHTML = "";

        // Reset buttons classes and load option text
        const cards = ["A", "B", "C"];
        cards.forEach(letter => {
            const btn = document.getElementById(`btn-opt-${letter}`);
            if (btn) {
                btn.className = "decision-option-card Y2K-card";
                btn.disabled = true; // Disabled during message typing stagger
                
                const txtSpan = btn.querySelector(".option-text");
                if (txtSpan) txtSpan.textContent = teamChat.options[letter];
            }
        });

        // Trigger sequential typing animations
        let delay = 300;
        teamChat.messages.forEach((msg, index) => {
            setTimeout(() => {
                if (!STATE.levelActive || STATE.currentLevel !== 1) return;
                
                const bubble = document.createElement("div");
                if (msg.isLeft) {
                    bubble.className = `chat-bubble left-bubble client-bubble ${msg.isUrgent ? 'urgent-highlight' : ''}`;
                    bubble.innerHTML = `
                        <div class="avatarCircle ${msg.avatarClass}">${msg.avatar}</div>
                        <div class="bubble-content-wrapper">
                            <div class="bubble-meta-info">
                                <span class="bubble-sender-name">${msg.sender}</span>
                                <span class="bubble-sender-role ${msg.roleClass}">${msg.role}</span>
                                <span class="bubble-sender-time">${msg.time}</span>
                            </div>
                            <div class="bubble-text-box">
                                <div class="bubble-text">${msg.text}</div>
                            </div>
                        </div>
                    `;
                } else {
                    bubble.className = `chat-bubble right-bubble team-bubble`;
                    bubble.innerHTML = `
                        <div class="bubble-content-wrapper">
                            <div class="bubble-meta-info" style="justify-content: flex-end;">
                                <span class="bubble-sender-time" style="order: 1; margin-left: 8px; margin-right: 0;">${msg.time}</span>
                                <span class="bubble-sender-role ${msg.roleClass}" style="order: 2; margin-left: 8px;">${msg.role}</span>
                                <span class="bubble-sender-name" style="order: 3;">${msg.sender}</span>
                            </div>
                            <div class="bubble-text-box" style="align-self: flex-end;">
                                <div class="bubble-text">${msg.text}</div>
                            </div>
                        </div>
                        <div class="avatarCircle ${msg.avatarClass}">${msg.avatar}</div>
                    `;
                }
                
                scrollList.appendChild(bubble);
                scrollList.scrollTop = scrollList.scrollHeight; // Auto scroll down
                AUDIO.playBleep(); // Play typing chiptune sound blip
                
                // Enable options if last message spawned
                if (index === teamChat.messages.length - 1) {
                    cards.forEach(letter => {
                        const btn = document.getElementById(`btn-opt-${letter}`);
                        if (btn) btn.disabled = false;
                    });
                }
            }, delay);
            delay += 950; // Comfortable dialogue stagger interval
        });

        setupLevel1Listeners();
    }

    function setupLevel1Listeners() {
        const optA = document.getElementById("btn-opt-A");
        const optB = document.getElementById("btn-opt-B");
        const optC = document.getElementById("btn-opt-C");

        if (!optA || !optB || !optC) return;

        optA.onclick = () => handleFeedbackRushAnswer("A");
        optB.onclick = () => handleFeedbackRushAnswer("B");
        optC.onclick = () => handleFeedbackRushAnswer("C");
    }

    function handleFeedbackRushAnswer(letter) {
        if (!STATE.levelActive || STATE.collapsed) return;

        STATE.totalDecisions++;

        const optA = document.getElementById("btn-opt-A");
        const optB = document.getElementById("btn-opt-B");
        const optC = document.getElementById("btn-opt-C");
        const selectedBtn = document.getElementById(`btn-opt-${letter}`);

        // Disable options during processing
        [optA, optB, optC].forEach(btn => { if (btn) btn.disabled = true; });

        const teamChat = LEVEL1_CHATS[STATE.selectedTeam || "Team1"];
        const feedbackText = teamChat.feedbacks[letter];

        if (letter === teamChat.correctAnswer) {
            STATE.correctDecisions++;
            
            if (STATE.selectedTeam === "Neon") {
                STATE.combo += 1;
            } else {
                STATE.combo++;
            }

            let pt = 100 * STATE.combo;
            STATE.score += pt;

            STATE.synergy = Math.min(100, STATE.synergy + 20);
            STATE.results = Math.min(100, STATE.results + 20);
            STATE.client = Math.min(100, STATE.client + 15);

            if (selectedBtn) {
                selectedBtn.classList.add("correct-highlight");
            }

            AUDIO.playCorrect();
            triggerRobot(true, feedbackText);

            updateHUD();

            setTimeout(() => {
                endLevel(true, "Alineaste las expectativas al 100%.");
            }, 3500);

        } else {
            STATE.combo = 1;
            let penaltyMultiplier = STATE.selectedTeam === "Sync" ? 0.6 : 1.0;

            STATE.score = Math.max(0, STATE.score - 10);
            STATE.synergy = Math.max(0, STATE.synergy - Math.round(15 * penaltyMultiplier));
            STATE.results = Math.max(0, STATE.results - Math.round(10 * penaltyMultiplier));
            STATE.client = Math.max(0, STATE.client - Math.round(10 * penaltyMultiplier));

            if (selectedBtn) selectedBtn.classList.add("error-highlight");

            AUDIO.playIncorrect();
            triggerScreenShake();

            triggerRobot(true, feedbackText, true);

            updateHUD();

            setTimeout(() => {
                if (!STATE.collapsed) {
                    [optA, optB, optC].forEach(btn => { if (btn) btn.disabled = false; });
                }
            }, 2500);
        }
    }

    // ==========================================================================
    // 10. MINIJUEGO 2 — KPI CHAOS
    // ==========================================================================
    
    const dragSourceList = document.getElementById("drag-source-list");
    const dropTargetList = document.getElementById("drop-target-list");
    const btnValidateKpiChaos = document.getElementById("btn-validate-kpi-chaos");
    
    function initLevel2() {
        const teamData = LEVEL2_DATA[STATE.selectedTeam || "Team1"];
        
        // Update header details
        const descTag = document.getElementById("lvl2-desc-tag");
        const metaTag = document.getElementById("lvl2-meta-tag");
        if (descTag) descTag.textContent = teamData.instruction;
        if (metaTag) metaTag.textContent = teamData.meta;

        dragSourceList.innerHTML = "";
        dropTargetList.innerHTML = "";
        
        // Randomize list from the selected team's tasks
        const scrambled = [...teamData.tasks].sort(() => Math.random() - 0.5);
        
        scrambled.forEach(task => {
            const card = document.createElement("div");
            card.className = "kpi-task-card Y2K-card";
            card.setAttribute("draggable", "true");
            card.setAttribute("id", task.id);
            card.innerHTML = `
                <span class="task-dot ${task.dotColor}-dot">●</span>
                <span class="task-text-content">${task.text}</span>
            `;
            
            // Support click to swap column directly (excellent mobile/touch support!)
            card.addEventListener("click", () => {
                swapTaskColumn(card);
            });

            // HTML5 Drag and drop support
            setupKpiDragListeners(card);
            
            dragSourceList.appendChild(card);
        });

        setupKpiDropzoneListeners();

        if (btnValidateKpiChaos) {
            btnValidateKpiChaos.onclick = () => validateKpiChaos();
        }
    }

    let draggedItem = null;

    function setupKpiDragListeners(card) {
        card.addEventListener("dragstart", (e) => {
            draggedItem = card;
            card.classList.add("dragging");
            e.dataTransfer.setData("text/plain", card.id);
            AUDIO.playBleep();
        });

        card.addEventListener("dragend", () => {
            card.classList.remove("dragging");
            draggedItem = null;
        });

        card.addEventListener("pointerdown", (e) => {
            card.style.touchAction = "none";
        });
    }

    function setupKpiDropzoneListeners() {
        const dropzones = [dragSourceList, dropTargetList];

        dropzones.forEach(zone => {
            zone.addEventListener("dragover", (e) => {
                e.preventDefault();
                zone.classList.add("drag-over");
            });

            zone.addEventListener("dragleave", () => {
                zone.classList.remove("drag-over");
            });

            zone.addEventListener("drop", (e) => {
                e.preventDefault();
                zone.classList.remove("drag-over");
                
                const id = e.dataTransfer.getData("text/plain") || (draggedItem ? draggedItem.id : null);
                if (!id) return;
                
                const card = document.getElementById(id);
                if (!card) return;

                zone.appendChild(card);
                AUDIO.playBleep();
            });
        });
    }

    function swapTaskColumn(card) {
        if (!STATE.levelActive || STATE.collapsed) return;
        
        AUDIO.playBleep();
        // If in Tareas Disponibles, move to Zona de Impacto, and vice-versa
        if (card.parentElement.id === "drag-source-list") {
            dropTargetList.appendChild(card);
        } else {
            dragSourceList.appendChild(card);
        }
    }

    function validateKpiChaos() {
        if (!STATE.levelActive || STATE.collapsed) return;

        const impactCards = dropTargetList.querySelectorAll(".kpi-task-card");
        const impactIds = Array.from(impactCards).map(card => card.id);

        const correctIds = ["tk1", "tk2", "tk3", "tk4"];
        
        // Count matches
        const hasAllCorrect = correctIds.every(id => impactIds.includes(id));
        const hasNoIncorrect = impactIds.every(id => correctIds.includes(id));

        if (hasAllCorrect && hasNoIncorrect) {
            // Perfect strategy victory!
            STATE.score += 150;
            STATE.synergy += 25;
            STATE.results += 30;
            STATE.client += 15;
            
            updateHUD();
            endLevel(true, "Alineaste la zona de impacto al 100% con tu meta estratégica.");
        } else {
            // Mistake penalty
            let penaltyMultiplier = STATE.selectedTeam === "Sync" ? 0.6 : 1.0;
            
            STATE.score = Math.max(0, STATE.score - 15);
            STATE.synergy = Math.max(0, STATE.synergy - Math.round(20 * penaltyMultiplier));
            STATE.results = Math.max(0, STATE.results - Math.round(20 * penaltyMultiplier));
            
            updateHUD();
            AUDIO.playIncorrect();
            triggerScreenShake();
            
            if (STATE.collapsed) return;
            
            // Helpful coaching tips
            if (impactIds.length < 4) {
                triggerRobot(true, "⚠️ Foco incompleto: te faltan acciones clave para cumplir la META de tu equipo.", true);
            } else if (impactIds.some(id => !correctIds.includes(id))) {
                triggerRobot(true, "🔴 ¡Cuidado! Arrastraste tareas operativas que no ayudan a cumplir tu meta estratégica.", true);
            } else {
                triggerRobot(true, "⚠️ Reordená y hacé foco. La Orientación a Resultados premia solo el impacto directo.", true);
            }
        }
    }

    // ==========================================================================
    // 11. MINIJUEGO 3 — KPI CATCHER
    // ==========================================================================
    
    const catcherCanvas = document.getElementById("kpi-catcher-canvas");
    const catcherCtx = catcherCanvas.getContext("2d");
    
    let kpiLoopId = null;
    let basket = { x: 0, y: 0, w: 95, h: 22, speed: 12 };
    let items = [];
    let catchingParticles = [];
    let itemSpawnTimer = 0;
    let floatingTexts = [];
    let bgStars = [];
    
    const itemsPool = {
        good: [
            "Impacto real", "Promesa cumplida", "Lead calificado", "Pase limpio", 
            "Desvío avisado", "Cliente feliz", "Foco estratégico", "Datos validados", 
            "Aporte de valor", "Sinergia activa", "Meta alcanzada", "Acuerdo claro", 
            "Solución viable", "Proceso ágil", "Entrega a tiempo", "Feedback constructivo", 
            "Claridad total", "Prioridad definida"
        ],
        bad: [
            "Retrabajo", "Silencio absoluto", "Reunión vacía", "Ambigüedad", 
            "Falsa urgencia", "Tarea mecánica", "Suposición", "Ruido operativo", 
            "Esfuerzo aislado", "Culpar al otro", "Entrega tarde", "Cambio a ciegas", 
            "Reporte inútil", "Parálisis por análisis", "Promesa rota", "Fricción interna", 
            "Tarea sin propósito", "Canal saturado"
        ]
    };

    const catcherPlayerImg = new Image();
    catcherPlayerImg.src = "catcher-avatar.png";

    function initLevel3() {
        catcherCanvas.width = catcherCanvas.parentElement.clientWidth;
        catcherCanvas.height = catcherCanvas.parentElement.clientHeight;
        
        basket.w = 120; // Adjust width for the image aspect ratio if needed
        basket.h = 120; // Adjust height for the image
        basket.y = catcherCanvas.height - basket.h - 10;
        basket.x = catcherCanvas.width / 2 - basket.w / 2;
        
        items = [];
        catchingParticles = [];
        floatingTexts = [];
        itemSpawnTimer = 0;
        
        bgStars = [];
        for(let i = 0; i < 60; i++) {
            bgStars.push({
                x: Math.random() * catcherCanvas.width,
                y: Math.random() * catcherCanvas.height,
                s: Math.random() * 2.5,
                speed: 0.2 + Math.random() * 0.8
            });
        }
        
        window.addEventListener("keydown", handleKpiKeys);
        window.addEventListener("keyup", handleKpiKeysUp);
        catcherCanvas.addEventListener("pointermove", handleKpiPointer);
        catcherCanvas.addEventListener("pointerdown", handleKpiPointer);
        
        if (kpiLoopId) cancelAnimationFrame(kpiLoopId);
        kpiLoopId = requestAnimationFrame(kpiLoopUpdate);
        
        triggerRobot(true, "Leé las tarjetas. ¡Atrapá solo impacto real y esquivá volumen vacío!");
    }

    let activeKeys = {};
    function handleKpiKeys(e) {
        activeKeys[e.key] = true;
    }
    function handleKpiKeysUp(e) {
        activeKeys[e.key] = false;
    }

    function handleKpiPointer(e) {
        const rect = catcherCanvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        basket.x = clientX - basket.w / 2;
        
        if (basket.x < 0) basket.x = 0;
        if (basket.x > catcherCanvas.width - basket.w) basket.x = catcherCanvas.width - basket.w;
    }

    function spawnFallingItem() {
        const isGood = Math.random() > 0.45;
        const isMystery = Math.random() > 0.80; // 20% chance to be mystery
        
        let text = isGood 
            ? itemsPool.good[Math.floor(Math.random() * itemsPool.good.length)]
            : itemsPool.bad[Math.floor(Math.random() * itemsPool.bad.length)];
            
        items.push({
            x: 20 + Math.random() * (catcherCanvas.width - 180),
            y: -25,
            w: 160,
            h: 30,
            text: text,
            isGood: isGood,
            isMystery: isMystery,
            speed: 2.2 + Math.random() * 2.0 + (STATE.timer < 25 ? 1.5 : 0)
        });
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            catchingParticles.push({
                x: x,
                y: y,
                vx: -3 + Math.random() * 6,
                vy: -3 + Math.random() * 6,
                size: 2.5 + Math.random() * 3.5,
                color: color,
                life: 30
            });
        }
    }

    function createFloatingText(x, y, str, color) {
        floatingTexts.push({
            x: x,
            y: y,
            str: str,
            color: color,
            life: 45
        });
    }

    function kpiLoopUpdate() {
        if (!STATE.levelActive || STATE.currentLevel !== 3 || STATE.collapsed) {
            if (kpiLoopId) cancelAnimationFrame(kpiLoopId);
            cleanupKpiListeners();
            return;
        }

        if (activeKeys["ArrowLeft"] || activeKeys["a"] || activeKeys["A"]) {
            basket.x -= basket.speed;
        }
        if (activeKeys["ArrowRight"] || activeKeys["d"] || activeKeys["D"]) {
            basket.x += basket.speed;
        }
        
        if (basket.x < 0) basket.x = 0;
        if (basket.x > catcherCanvas.width - basket.w) basket.x = catcherCanvas.width - basket.w;

        // Clean grid drawing with an attractive gradient background
        const bgGradient = catcherCtx.createLinearGradient(0, 0, 0, catcherCanvas.height);
        bgGradient.addColorStop(0, "#080c17");
        bgGradient.addColorStop(1, "#1B2238");
        catcherCtx.fillStyle = bgGradient;
        catcherCtx.fillRect(0, 0, catcherCanvas.width, catcherCanvas.height);
        
        // Draw galaxy stars
        catcherCtx.fillStyle = "#ffffff";
        bgStars.forEach(star => {
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = catcherCanvas.height;
                star.x = Math.random() * catcherCanvas.width;
            }
            catcherCtx.globalAlpha = 0.3 + (Math.random() * 0.5);
            catcherCtx.beginPath();
            catcherCtx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
            catcherCtx.fill();
        });
        catcherCtx.globalAlpha = 1.0;
        
        catcherCtx.strokeStyle = "rgba(123, 92, 255, 0.15)";
        catcherCtx.lineWidth = 2.5;
        
        for (let x = 0; x < catcherCanvas.width; x += 45) {
            catcherCtx.beginPath();
            catcherCtx.moveTo(x, 0);
            catcherCtx.lineTo(x, catcherCanvas.height);
            catcherCtx.stroke();
        }
        for (let y = 0; y < catcherCanvas.height; y += 45) {
            catcherCtx.beginPath();
            catcherCtx.moveTo(0, y);
            catcherCtx.lineTo(catcherCanvas.width, y);
            catcherCtx.stroke();
        }

        itemSpawnTimer++;
        const spawnDelay = STATE.timer < 25 ? 38 : 60;
        if (itemSpawnTimer > spawnDelay) {
            spawnFallingItem();
            itemSpawnTimer = 0;
        }

        // Draw custom player sprite instead of the generic basket
        if (catcherPlayerImg.complete && catcherPlayerImg.naturalWidth !== 0) {
            catcherCtx.drawImage(catcherPlayerImg, basket.x, basket.y, basket.w, basket.h);
        } else {
            // Fallback if image fails to load
            catcherCtx.fillStyle = "#ffffff";
            catcherCtx.strokeStyle = "#000000";
            catcherCtx.lineWidth = 3.5;
            catcherCtx.beginPath();
            catcherCtx.roundRect(basket.x, basket.y, basket.w, basket.h, 6);
            catcherCtx.fill();
            catcherCtx.stroke();
            catcherCtx.fillStyle = "var(--color-tht-green)";
            catcherCtx.fillRect(basket.x + 8, basket.y + 4, basket.w - 16, basket.h - 8);
        }

        // Update items
        items.forEach((item, idx) => {
            item.y += item.speed;
            
            if (item.isMystery) {
                catcherCtx.fillStyle = "#FFD700"; // Yellow mystery box
            } else {
                catcherCtx.fillStyle = item.isGood ? "#0DCC67" : "#FA5432";
            }
            
            catcherCtx.strokeStyle = "#000000";
            catcherCtx.lineWidth = 3;
            
            catcherCtx.beginPath();
            catcherCtx.roundRect(item.x, item.y, item.w, item.h, 6);
            catcherCtx.fill();
            catcherCtx.stroke();
            
            catcherCtx.fillStyle = "rgba(0, 0, 0, 0.15)";
            catcherCtx.fillRect(item.x + 3, item.y + item.h - 5, item.w - 6, 5);
            // All boxes get black text for readability
            catcherCtx.fillStyle = "#000000";
            
            catcherCtx.font = "bold 12px 'Space Grotesk', sans-serif";
            catcherCtx.textAlign = "center";
            catcherCtx.textBaseline = "middle";
            catcherCtx.fillText(item.text, item.x + item.w / 2, item.y + item.h / 2);

            // Collisions
            if (
                item.y + item.h >= basket.y &&
                item.y <= basket.y + basket.h &&
                item.x + item.w >= basket.x &&
                item.x <= basket.x + basket.w
            ) {
                items.splice(idx, 1);
                
                if (item.isGood) {
                    let ptBonus = 10;
                    if (STATE.selectedTeam === "Impact") {
                        ptBonus = 20; 
                    }
                    
                    if (STATE.selectedTeam === "Neon") {
                        STATE.combo += 1;
                    } else {
                        STATE.combo = Math.min(4, STATE.combo + 0.5);
                    }
                    
                    STATE.score += Math.round(ptBonus * Math.floor(STATE.combo));
                    STATE.results += 8;
                    STATE.synergy += 6;
                    
                    AUDIO.playCatch();
                    createExplosion(item.x + item.w/2, item.y + item.h/2, "var(--color-tht-green)");
                    createFloatingText(item.x + item.w/2, item.y, `+${Math.round(ptBonus * Math.floor(STATE.combo))}`, "var(--color-tht-green)");
                } else {
                    STATE.combo = 1;
                    STATE.score = Math.max(0, STATE.score - 8);
                    
                    let penaltyMultiplier = STATE.selectedTeam === "Sync" ? 0.6 : 1.0;
                    STATE.results = Math.max(0, STATE.results - Math.round(10 * penaltyMultiplier));
                    STATE.client = Math.max(0, STATE.client - Math.round(15 * penaltyMultiplier));
                    
                    AUDIO.playIncorrect();
                    triggerScreenShake();
                    createExplosion(item.x + item.w/2, item.y + item.h/2, "var(--color-tht-orange)");
                    createFloatingText(item.x + item.w/2, item.y, "-8 Tarea Sin Valor", "var(--color-tht-orange)");
                }
                updateHUD();
            }
            
            // Missed item
            if (item.y > catcherCanvas.height) {
                items.splice(idx, 1);
                if (item.isGood) {
                    STATE.combo = 1;
                    STATE.synergy = Math.max(0, STATE.synergy - 10); // friendly deduction
                    createFloatingText(item.x + item.w/2, catcherCanvas.height - 15, "¡KPI perdido!", "var(--color-tht-orange)");
                    updateHUD();
                }
            }
        });

        // Particles
        catchingParticles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            catcherCtx.fillStyle = p.color;
            catcherCtx.beginPath();
            catcherCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            catcherCtx.fill();
            
            if (p.life <= 0) {
                catchingParticles.splice(idx, 1);
            }
        });

        // Floating texts
        floatingTexts.forEach((ft, idx) => {
            ft.y -= 1.2;
            ft.life--;
            
            catcherCtx.fillStyle = ft.color;
            catcherCtx.font = "900 13px 'Space Grotesk', sans-serif";
            catcherCtx.shadowColor = "#000000";
            catcherCtx.shadowBlur = 1.5;
            catcherCtx.fillText(ft.str, ft.x, ft.y);
            catcherCtx.shadowBlur = 0;
            
            if (ft.life <= 0) {
                floatingTexts.splice(idx, 1);
            }
        });

        if (STATE.timer <= 0) {
            cleanupKpiListeners();
            endLevel(true, "¡Operación completada en la arena de foco!");
            return;
        }

        kpiLoopId = requestAnimationFrame(kpiLoopUpdate);
    }

    function cleanupKpiListeners() {
        window.removeEventListener("keydown", handleKpiKeys);
        window.removeEventListener("keyup", handleKpiKeysUp);
        catcherCanvas.removeEventListener("pointermove", handleKpiPointer);
        catcherCanvas.removeEventListener("pointerdown", handleKpiPointer);
        activeKeys = {};
    }

    // ==========================================================================
    // 12. RESULTS SCREEN DISPLAY (VICTORY SHINES & DIRECT RESTART ACTION)
    // ==========================================================================
    
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    function showResultsScreen() {
        STATE.gameActive = false;
        STATE.levelActive = false;
        AUDIO.stopMusic();
        
        showScreen("results");
        
        // 1. Sonido de Gloria
        AUDIO.playVictoryFanfare();
        
        // 2. Imagen del Avatar
        const avatarImg = document.getElementById("results-avatar-img");
        if (STATE.selectedTeam === "Team1") avatarImg.src = "comunicacion.png";
        else if (STATE.selectedTeam === "Team2") avatarImg.src = "sinergia.png";
        else avatarImg.src = "equipo_estrella.png";
        
        // 3. Animación del Score
        const scoreElement = document.getElementById("results-score");
        animateValue(scoreElement, 0, STATE.score, 1800);

        // 5. Animación de las Barras y Textos
        document.getElementById("results-synergy").textContent = `${Math.min(100, STATE.synergy)}/100`;
        document.getElementById("results-results").textContent = `${Math.min(100, STATE.results)}/100`;
        document.getElementById("results-client").textContent = `${Math.min(100, STATE.client)}/100`;
        document.getElementById("results-decisions").textContent = `${STATE.correctDecisions}/${STATE.totalDecisions}`;

        // Reset widths to 0 to ensure transition plays
        document.querySelector(".results-progress-bar-fill").style.width = "0%";
        document.getElementById("results-bar-synergy").style.width = "0%";
        document.getElementById("results-bar-results").style.width = "0%";
        document.getElementById("results-bar-client").style.width = "0%";
        document.getElementById("results-bar-decisions").style.width = "0%";

        setTimeout(() => {
            const pbFill = document.querySelector(".results-progress-bar-fill");
            if(pbFill) pbFill.style.width = "100%";
            
            document.getElementById("results-bar-synergy").style.width = `${Math.min(100, STATE.synergy)}%`;
            document.getElementById("results-bar-results").style.width = `${Math.min(100, STATE.results)}%`;
            document.getElementById("results-bar-client").style.width = `${Math.min(100, STATE.client)}%`;
            const decisionsPct = STATE.totalDecisions > 0 ? (STATE.correctDecisions / STATE.totalDecisions) * 100 : 0;
            document.getElementById("results-bar-decisions").style.width = `${Math.min(100, decisionsPct)}%`;
        }, 150);

        // 6. Efecto Visual de Victoria
        document.body.classList.add("victory-explosion");
        triggerVictoryFlatParticles();
    }

    function triggerVictoryFlatParticles() {
        for (let i = 0; i < 40; i++) {
            PARTICLES.particles.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + Math.random() * 200,
                speed: 3.5 + Math.random() * 4.5,
                size: 3.5 + Math.random() * 5.0,
                color: "rgba(13, 204, 103, 0.7)", 
                pulseSpeed: 0.05,
                pulse: Math.random()
            });
        }
    }

    // Direct restart loop when Results main button clicked (No reflection/printable badges)
    btnRestartFromResults.addEventListener("click", () => {
        AUDIO.playCorrect();
        triggerRestartAndClean();
    });

    function triggerRestartAndClean() {
        document.body.className = "";
        
        // Reset state parameters
        STATE.score = 0;
        STATE.timer = 50;
        STATE.combo = 1;
        STATE.synergy = 80;
        STATE.results = 80;
        STATE.client = 80;
        STATE.currentLevel = 1;
        STATE.selectedTeam = null;
        STATE.totalDecisions = 0;
        STATE.correctDecisions = 0;
        STATE.gameActive = false;
        STATE.levelActive = false;
        STATE.collapsed = false;
        
        // Reset squads grid
        squadCards.forEach(c => c.classList.remove("selected"));
        btnConfirmSquad.classList.add("locked");
        btnConfirmSquad.setAttribute("disabled", "true");
        
        // Reset level nodes maps
        levelNodes.forEach((node, idx) => {
            if (idx > 0) {
                node.className = "level-node Y2K-card locked";
                node.querySelector(".level-status-tag").textContent = "BLOQUEADO";
            } else {
                node.className = "level-node Y2K-card active selected";
                node.querySelector(".level-status-tag").textContent = "DISPONIBLE";
            }
        });
        
        btnStartLevel.classList.add("locked");
        btnStartLevel.setAttribute("disabled", "true");

        showScreen("intro");
        btnStartGame.classList.remove("hidden");
        introLoading.classList.add("hidden");
    }
});
