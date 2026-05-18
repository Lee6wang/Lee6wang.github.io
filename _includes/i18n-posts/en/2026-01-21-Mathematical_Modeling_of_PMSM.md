# Mathematical Modeling of Permanent Magnet Synchronous Motors

## Foreword

> This article is a personal study note. The main reference is  
> **Modern Permanent Magnet Synchronous Motor Control Principles and MATLAB Simulation**, edited by Yuan Lei.

Because the direction of my research group is related to motors, I will continue writing a lot of material about motors, whether it is DSP control or motor-control algorithm design. All of these topics require an understanding of the mathematical model of the motor, so I first organized the modeling part for later reference.

The logic of this article is basically consistent with Yuan Lei's book, but I made some adjustments and additions to make the content easier to understand.

Since I am still a beginner, there will inevitably be places where my understanding is incomplete. Corrections are welcome.

---

## 1. Basic Mathematical Model of a Three-Phase PMSM

To simplify the analysis, assume that the three-phase PMSM is an **ideal motor** and satisfies the following conditions:

- Magnetic saturation of the motor core is ignored.
- Eddy-current loss and hysteresis loss are ignored.
- The stator currents are balanced three-phase sinusoidal waves.

### 1.1 Three-Phase Voltage Equation

In the natural coordinate system \(ABC\), the voltage equation of a three-phase PMSM is:

$$
u_{3s} = R\,i_{3s} + \frac{d\psi_{3s}}{dt}
\tag{1}
$$

### 1.2 Flux-Linkage Equation

The flux-linkage equation can be expressed as:

$$
\psi_{3s} = L_{3s} i_{3s} + \psi_f\, F_{3s}(\theta_e)
\tag{2}
$$

The variables are defined as follows:

$$
\begin{aligned}
i_{3s} &=
\begin{bmatrix}
i_A \\ i_B \\ i_C
\end{bmatrix}, \qquad
u_{3s} =
\begin{bmatrix}
u_A \\ u_B \\ u_C
\end{bmatrix}, \\[6pt]
\psi_{3s} &=
\begin{bmatrix}
\psi_A \\ \psi_B \\ \psi_C
\end{bmatrix}, \qquad
R_{3s} =
\begin{bmatrix}
R & 0 & 0 \\
0 & R & 0 \\
0 & 0 & R
\end{bmatrix},
\end{aligned}
$$

The permanent-magnet flux-linkage distribution function is:

$$
F_{3s}(\theta_e) =
\begin{bmatrix}
\cos \theta_e \\
\cos\!\left(\theta_e - \frac{2\pi}{3}\right) \\
\cos\!\left(\theta_e + \frac{2\pi}{3}\right)
\end{bmatrix}
$$

The stator inductance matrix is:

$$
L_{3s} =
L_{m3}
\begin{bmatrix}
1 & \cos\!\frac{2\pi}{3} & \cos\!\frac{4\pi}{3} \\
\cos\!\frac{2\pi}{3} & 1 & \cos\!\frac{2\pi}{3} \\
\cos\!\frac{4\pi}{3} & \cos\!\frac{2\pi}{3} & 1
\end{bmatrix}
+
L_{\sigma 3}
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

Here \(L_{m3}\) is the three-phase stator mutual inductance, \(L_{\sigma 3}\) is the stator leakage inductance, \(\psi_f\) is the amplitude of the permanent-magnet flux linkage, and \(\theta_e\) is the electrical angle of the motor.

---

### 1.3 Electromagnetic Torque Equation

According to the principle of electromechanical energy conversion, electromagnetic torque is equal to the partial derivative of magnetic co-energy with respect to mechanical angle:

$$
T_e =
\frac{p_n}{2}
\frac{\partial}{\partial \theta_m}
\left(
i_{3s}^{\mathrm{T}} \psi_{3s}
\right)
\tag{3}
$$

Here \(p_n\) is the number of motor pole pairs.

It is useful to add that the relationship between mechanical angle \(\theta_m\) and electrical angle \(\theta_e\) is:

$$
\theta_e = \frac{p_n}{2} \theta_m
$$

> Electrical angle is used to describe the phase of the rotating stator magnetic field. It is not simply the physical angle through which the rotor has rotated in space.

---

### 1.4 Mechanical Motion Equation

The mechanical motion equation of the motor is:

$$
J \frac{d\omega_m}{dt} =
T_e - T_L - B\,\omega_m
\tag{4}
$$

where:

- \(J\): moment of inertia
- \(\omega_m\): mechanical angular speed
- \(T_L\): load torque
- \(B\): viscous damping coefficient

---

## 2. Coordinate Transformation of PMSM

To simplify the mathematical model, coordinate transformations are usually used to transform the model from the three-phase stationary coordinate system into a two-phase rotating coordinate system.

![Coordinate transformation](../assets/figure/2026-01-21/1.png)

Here \(ABC\) is the natural coordinate system, \(\alpha\beta\) is the two-phase stationary coordinate system, and \(dq\) is the synchronous rotating coordinate system.

---

### 2.1 Clarke Transformation

The Clarke transformation maps variables from the three-phase coordinate system to the two-phase stationary coordinate system:

$$
\begin{bmatrix}
f_\alpha \\
f_\beta \\
f_0
\end{bmatrix} =
T_{3s/2s}
\begin{bmatrix}
f_A \\ f_B \\ f_C
\end{bmatrix}
\tag{5}
$$

where:

$$
T_{3s/2s} =
\frac{2}{3}
\begin{bmatrix}
1 & -\frac{1}{2} & -\frac{1}{2} \\
0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \\
\frac{1}{2} & \frac{1}{2} & \frac{1}{2}
\end{bmatrix}
$$

The inverse Clarke transformation is:

$$
\begin{bmatrix}
f_A \\ f_B \\ f_C
\end{bmatrix} =
T_{2s/3s}
\begin{bmatrix}
f_\alpha \\ f_\beta \\ f_0
\end{bmatrix}
\tag{6}
$$

$$
T_{2s/3s} =
\begin{bmatrix}
1 & 0 & \frac{\sqrt{2}}{2} \\
-\frac{1}{2} & \frac{\sqrt{3}}{2} & \frac{\sqrt{2}}{2} \\
-\frac{1}{2} & -\frac{\sqrt{3}}{2} & \frac{\sqrt{2}}{2}
\end{bmatrix}
$$

---

### 2.2 Park Transformation

The Park transformation maps variables from the \(\alpha\beta\) coordinate system to the rotating coordinate system:

$$
\begin{bmatrix}
f_d \\ f_q
\end{bmatrix} =
T_{2s/2r}
\begin{bmatrix}
f_\alpha \\ f_\beta
\end{bmatrix}
\tag{7}
$$

$$
T_{2s/2r} =
\begin{bmatrix}
\cos \theta_e & \sin \theta_e \\
-\sin \theta_e & \cos \theta_e
\end{bmatrix}
$$

The inverse Park transformation is:

$$
T_{2r/2s} =
\begin{bmatrix}
\cos \theta_e & -\sin \theta_e \\
\sin \theta_e & \cos \theta_e
\end{bmatrix}
\tag{8}
$$

---

### 2.3 Combined Coordinate Transformation

Combining the Clarke and Park transformations gives:

$$
\begin{bmatrix}
f_d \\ f_q
\end{bmatrix} =
T_{3s/2r}
\begin{bmatrix}
f_A \\ f_B \\ f_C
\end{bmatrix}
\tag{9}
$$

$$
T_{3s/2r} =
\frac{2}{3}
\begin{bmatrix}
\cos \theta_e &
\cos\!\left(\theta_e - \frac{2\pi}{3}\right) &
\cos\!\left(\theta_e + \frac{2\pi}{3}\right) \\
\sin \theta_e &
\sin\!\left(\theta_e - \frac{2\pi}{3}\right) &
\sin\!\left(\theta_e + \frac{2\pi}{3}\right)
\end{bmatrix}
$$

---

### 2.4 Difference Between the MATLAB Coordinate System and the Theoretical Coordinate System

The coordinate system used in MATLAB differs from the theoretical derivation by **90 electrical degrees**:

![MATLAB coordinate system](../assets/figure/2026-01-21/2.png)

The relationship is:

$$
\begin{aligned}
\begin{bmatrix}
f_{\alpha'} \\ f_{\beta'}
\end{bmatrix}
&=
\begin{bmatrix}
0 & -1 \\ 1 & 0
\end{bmatrix}
\begin{bmatrix}
f_\alpha \\ f_\beta
\end{bmatrix}, \\[6pt]
\begin{bmatrix}
f_{d'} \\ f_{q'}
\end{bmatrix}
&=
\begin{bmatrix}
0 & -1 \\ 1 & 0
\end{bmatrix}
\begin{bmatrix}
f_d \\ f_q
\end{bmatrix}.
\end{aligned}
$$

The corresponding MATLAB Clarke and Park transformation matrices are:

$$
T_{3s/2s}' =
\frac{2}{3}
\begin{bmatrix}
-\frac{1}{2} & -\frac{1}{2} & 1 \\
\frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} & 0
\end{bmatrix}
$$

$$
T_{2s/2r}' =
\begin{bmatrix}
\sin \theta_e & -\cos \theta_e \\
\cos \theta_e & \sin \theta_e
\end{bmatrix}
$$

$$
T_{3s/2r}' =
\frac{2}{3}
\begin{bmatrix}
\sin \theta_e &
\sin\!\left(\theta_e - \frac{2\pi}{3}\right) &
\sin\!\left(\theta_e + \frac{2\pi}{3}\right) \\
-\cos \theta_e &
-\cos\!\left(\theta_e - \frac{2\pi}{3}\right) &
-\cos\!\left(\theta_e + \frac{2\pi}{3}\right)
\end{bmatrix}
$$

---

## 3. Mathematical Model of PMSM in the \(dq\) Coordinate System

The mathematical model of a PMSM in the \(dq\) coordinate system can be listed as follows. The general stator voltage equation is:

$$
\begin{cases}
u_d = R\,i_d + \dfrac{d\psi_d}{dt} - \omega_e\,\psi_q, \\
u_q = R\,i_q + \dfrac{d\psi_q}{dt} + \omega_e\,\psi_d.
\end{cases}
\tag{10}
$$

In the equation above, \(\dfrac{d\psi_d}{dt}\) represents the most basic electromagnetic relationship:

> Voltage equals the time rate of change of flux linkage. In any coordinate system, as long as the flux linkage changes, voltage will be produced.

At the same time, in a rotating coordinate system, the time derivative of a vector is not an ordinary derivative, but:

$$
\frac{d\psi}{dt} = \left( \frac{d\psi}{dt} \right)_{\text{stationary}} + \omega_e \times \psi
$$

Therefore, in the $dq$ coordinate system, additional cross terms related to the rotational speed $\omega_e$ appear in the voltage equation. The term $\omega_e \times \psi$ is exactly the extra term seen at the end of the formula.

> This term is not a loss and is not the back EMF itself. It is a speed-coupling term introduced by the coordinate transformation.  
> However, in steady state, its value is equivalent to the contribution of back EMF.

The stator flux-linkage equation is:

$$
\begin{cases}
\psi_d = L_d\, i_d + \psi_f, \\
\psi_q = L_q\, i_q.
\end{cases}
\tag{11}
$$

It can be seen that the d-axis contains an additional term \(\psi_f\), which is the contribution of the permanent-magnet flux linkage.

This is because the d-axis **always rotates with the direction of the permanent-magnet pole**. In this coordinate system, the permanent magnet has constant magnitude, fixed direction, and lies entirely on the d-axis.

Combining equations 10 and 11 gives:

$$
\begin{bmatrix}
u_d \\ u_q
\end{bmatrix} =
\begin{bmatrix}
R & \omega_e L_q \\
-\omega_e L_d & R
\end{bmatrix}
\begin{bmatrix}
i_d \\ i_q
\end{bmatrix} +
\frac{d}{dt}
\begin{bmatrix}
L_d & 0 \\ 0 & L_q
\end{bmatrix}
\begin{bmatrix}
i_d \\ i_q
\end{bmatrix} +
\begin{bmatrix}
0 \\ \omega_e \psi_f
\end{bmatrix}
\tag{12}
$$

Here \(u_d, u_q\) are stator voltages in the \(dq\) coordinate system, \(i_d, i_q\) are stator currents in the \(dq\) coordinate system, \(\psi_d, \psi_q\) are flux linkages, \(\omega_e\) is electrical angular speed, \(L_d, L_q\) are the stator d-axis and q-axis inductances, and \(\psi_f\) is permanent-magnet flux linkage.

![dq equivalent circuit](../assets/figure/2026-01-21/3.png)

According to the equation above, the equivalent circuit can be obtained as shown in the figure. The electromagnetic torque equation at this time is:

$$
T_e = \frac{3}{2} p_n \left[ \psi_f i_q + (L_d - L_q) i_d i_q \right]
\tag{13}
$$

where \(p_n\) is the number of motor pole pairs.

For a surface-mounted PMSM, \(L_d = L_q\), so the electromagnetic torque equation simplifies to:

$$
T_e = \frac{3}{2} p_n \psi_f i_q
\tag{14}
$$

In simulation, several important relationships are also used:

$$
\begin{cases}
\omega_e = n_p\,\omega_m, \\[4pt]
N_r = \dfrac{30}{\pi}\,\omega_m, \\[6pt]
\theta_e = \displaystyle \int \omega_e \, dt.
\end{cases}
$$

Here \(n_p\) is the number of pole pairs, \(N_r\) is rotational speed in rpm, \(\omega_m\) is mechanical angular speed in rad/s, and \(\theta_e\) is the motor electrical angle.

---

## 4. Mathematical Model of PMSM in the \(\alpha \beta\) Coordinate System

To obtain the mathematical model of a PMSM in the \(\alpha \beta\) coordinate system, the model in the \(dq\) coordinate system can be transformed through the inverse Park transformation:

$$
\begin{bmatrix}
u_\alpha \\
u_\beta
\end{bmatrix}=
\underbrace{
\begin{bmatrix}
R & 0 \\
0 & R
\end{bmatrix}
\begin{bmatrix}
i_\alpha \\ i_\beta
\end{bmatrix}
}_{\text{resistance term}}
+
\underbrace{
\frac{d}{dt}
\left(
\begin{bmatrix}
L_\alpha & L_{\alpha\beta} \\
L_{\alpha\beta} & L_\beta
\end{bmatrix}
\begin{bmatrix}
i_\alpha \\ i_\beta
\end{bmatrix}
\right)
}_{\text{inductance term}}
+
\underbrace{
\omega_e \psi_f
\begin{bmatrix}
-\sin\theta_e \\
\cos\theta_e
\end{bmatrix}
}_{\text{permanent-magnet back EMF}}
\tag{15}
$$

Here \(L_\alpha, L_\beta\) are stator inductances in the \(\alpha \beta\) coordinate system, \(i_\alpha, i_\beta\) are stator currents in the \(\alpha \beta\) coordinate system, and \(u_\alpha, u_\beta\) are stator voltages in the \(\alpha \beta\) coordinate system. They satisfy:

$$
\begin{cases}
L_\alpha = L_0 + L_1 \cos(2\theta_e), \\[4pt]
L_\beta = L_0 - L_1 \cos(2\theta_e), \\[4pt]
L_{\alpha\beta} = L_1 \sin(2\theta_e), \\[6pt]
L_0 = \dfrac{L_d + L_q}{2}, \\[6pt]
L_1 = \dfrac{L_d - L_q}{2}.
\end{cases}
\tag{16}
$$

Here \(L_0\) is the average inductance, and \(L_1\) represents the strength of magnetic anisotropy.

Looking at equation 15, \(\theta_e\) comes from the permanent magnet. It determines the projection direction of the permanent-magnet flux linkage in the \(\alpha \beta\) coordinate system. Traditional back-EMF methods, PLL, SMO, and other position-estimation methods are all based on this principle.

Looking at equation 16, \(2\theta_e\) comes entirely from inductance asymmetry. This is because the motor has different d-axis and q-axis inductances. In the \(\alpha \beta\) coordinate system, the inductance matrix changes periodically as the permanent magnet rotates. The period is 180 electrical degrees, or \(\pi\) radians, so \(2\theta_e\) appears. High-frequency injection, saliency-based methods, and other position-estimation methods are based on this principle.

Because both \(\theta_e\) and \(2\theta_e\) appear, the mathematical model in the \(\alpha \beta\) coordinate system becomes very complicated. Therefore, first rewrite equation 15 and organize it as:

$$
\begin{aligned}
\begin{bmatrix}
u_\alpha \\
u_\beta
\end{bmatrix}
&=
R
\begin{bmatrix}
i_\alpha \\
i_\beta
\end{bmatrix}
+
\frac{d}{dt}
\left(
L_0
\begin{bmatrix}
i_\alpha \\
i_\beta
\end{bmatrix}
\right) \\[6pt]
&\quad+
\frac{d}{dt}
\left(
L_1
\begin{bmatrix}
\cos 2\theta_e & \sin 2\theta_e \\
\sin 2\theta_e & -\cos 2\theta_e
\end{bmatrix}
\begin{bmatrix}
i_\alpha \\
i_\beta
\end{bmatrix}
\right) \\[6pt]
&\quad+
\omega_e \psi_f
\begin{bmatrix}
-\sin \theta_e \\
\cos \theta_e
\end{bmatrix}
\end{aligned}
\tag{17}
$$

Then rewrite the voltage equation in the \(dq\) axes as:

$$
\begin{bmatrix}
u_d \\
u_q
\end{bmatrix}=
\begin{bmatrix}
R + \dfrac{d}{dt}L_d & -\omega_e L_q \\
\omega_e L_d & R + \dfrac{d}{dt}L_q
\end{bmatrix}
\begin{bmatrix}
i_d \\
i_q
\end{bmatrix}
+
\begin{bmatrix}
0 \\
(L_d - L_q)\!\left(\omega_e i_d - \dfrac{d i_q}{dt}\right) + \omega_e \psi_f
\end{bmatrix}
\tag{18}
$$

Transforming it into the stationary \(\alpha \beta\) coordinate system gives:

$$
\begin{aligned}
\begin{bmatrix}
u_\alpha \\
u_\beta
\end{bmatrix}
&=
\underbrace{
\begin{bmatrix}
R + \dfrac{d}{dt}L_d & \omega_e (L_d - L_q) \\
-\omega_e (L_d - L_q) & R + \dfrac{d}{dt}L_d
\end{bmatrix}
\begin{bmatrix}
i_\alpha \\
i_\beta
\end{bmatrix}
}_{\text{resistance + equivalent inductance + saliency coupling}}
\\[10pt]
&\quad+
\underbrace{
\Big[
(L_d - L_q)\big(\omega_e i_d - \dot{i}_q\big)
+
\omega_e \psi_f
\Big]
\begin{bmatrix}
-\sin\theta_e \\
\cos\theta_e
\end{bmatrix}
}_{\text{position-dependent excitation term}}
\end{aligned}
\tag{19}
$$

There are several important points in this equation.

**First part: matrix multiplied by current.**

1. Diagonal term: \(R + \dfrac{d}{dt}L_d\)

- \(Ri\): resistance voltage drop
- \(\dfrac{d}{dt}L_d i\): inductive dynamic term

> This defines the dynamic response characteristic of the system. In essence, it is an RL system.

2. Off-diagonal term: \(\pm \omega_e (L_d - L_q)\)

The key part is:

$$
\omega_e (L_d - L_q)
$$

It represents:

> Magnetic anisotropy + rotational speed -> inter-axis coupling

- Surface-mounted PMSM (SPMSM): \(L_d = L_q\), so there is no inter-axis coupling.
- Interior PMSM or synchronous reluctance motor: \(L_d \ne L_q\), so inter-axis coupling exists.

**Second part: position-dependent excitation term.**

1. Permanent-magnet back EMF: \(\omega_e \psi_f\)

This term has already been discussed above.

2. Reluctance-related excitation: \((L_d - L_q)\big(\omega_e i_d - \dot{i}_q\big)\)

This term exists only in interior PMSM or synchronous reluctance motors.

In the stationary coordinate system, the electromagnetic torque equation can be expressed as:

$$
T_e=
\frac{3}{2}\,p_n\!\left(
\psi_\alpha\, i_\beta-
\psi_\beta\, i_\alpha
\right)
\tag{20}
$$

The stator flux-linkage equations are:

$$
\begin{cases}
\dfrac{d\psi_\alpha}{dt} = u_\alpha - R\,i_\alpha, \\
\dfrac{d\psi_\beta}{dt} = u_\beta - R\,i_\beta.
\end{cases}
$$

Here \(\psi_\alpha, \psi_\beta\) are stator flux linkages in the \(\alpha \beta\) coordinate system.

The magnitude of the flux linkage is:

$$
\psi_s = \sqrt{\psi_\alpha^2 + \psi_\beta^2}
\tag{21}
$$

The following current equations in the stationary coordinate system are given here without further explanation:

$$
\frac{d i_\alpha}{dt}=
\frac{1}{L_d}\,\omega_m \psi_\beta+
\left(u_\alpha - R i_\alpha\right)
\left(
\frac{1}{L_d}\cos^2\theta_m+
\frac{1}{L_q}\sin^2\theta_m
\right)+
\frac{1}{2}
\left(u_\beta - R i_\beta\right)
\sin 2\theta_m
\left(
\frac{1}{L_d}-
\frac{1}{L_q}
\right)
$$

$$
\frac{d i_\beta}{dt}=
\frac{1}{L_d}\,\omega_m \psi_\alpha+
\left(u_\beta - R i_\beta\right)
\left(
\frac{1}{L_d}\sin^2\theta_m+
\frac{1}{L_q}\cos^2\theta_m
\right)+
\frac{1}{2}
\left(u_\alpha - R i_\alpha\right)
\sin 2\theta_m
\left(
\frac{1}{L_d}-
\frac{1}{L_q}
\right)
$$

where:

$$
\psi_\alpha=
\frac{L_d}{L_q}\,\psi_f \cos\theta_m-
\left(
1 - \frac{L_d}{L_q}
\right)
L_0
\left(
i_\alpha \cos 2\theta_m+
i_\beta \sin 2\theta_m
\right)+
L_2 i_\alpha
$$

$$
\psi_\beta=
\frac{L_d}{L_q}\,\psi_f \sin\theta_m-
\left(
1 - \frac{L_d}{L_q}
\right)
L_0
\left(
i_\beta \cos 2\theta_m+
i_\alpha \sin 2\theta_m
\right)+
L_2 i_\beta
$$

The mechanical motion equation of the motor in the stationary coordinate system is:

$$
J\,\frac{d\omega_m}{dt}=
\psi_\alpha i_\beta-
\psi_\beta i_\alpha-
T_L
$$

$$
\frac{d\theta_m}{dt}=
\omega_m
$$

## 5. Summary

This article organized the mathematical model of the permanent magnet synchronous motor. It described the model in the natural coordinate system \(ABC\), the two-phase stationary coordinate system \(\alpha \beta\), and the two-phase rotating coordinate system \(dq\), and analyzed the characteristics and application scenarios of the model in each coordinate system.

Understanding these mathematical models is important for the design and implementation of motor-control algorithms. I hope this article can provide a useful reference for readers working on motor-control research and applications.
