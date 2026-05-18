# Mathematical Modeling of Permanent Magnet Linear Synchronous Motors (PMLSM): Similarities and Differences with Rotary PMSM

## Foreword

This article focuses on the mathematical modeling of permanent magnet linear synchronous motors (PMLSM). The modeling framework is migrated and organized from the classical method used for rotary permanent magnet synchronous motors (PMSM), with additional explanations for the geometric quantities and physical mapping relations that are unique to linear motors.

The core idea is to directly migrate the mature "ABC -> alpha-beta -> dq" coordinate-transformation system from rotary PMSM to linear motors. Only the following equivalent substitutions are needed:

1. Angle variable: \(\theta \rightarrow x\) (position)
2. Speed variable: \(\omega \rightarrow v\) (linear speed)
3. Output physical quantity: \(T \rightarrow F\) (thrust)

Under these substitutions, the basic form of the electromagnetic equations remains consistent.

---

## 1. Basic Mathematical Model of a Three-Phase PMLSM (ABC Coordinate System)

This section establishes the basic equation set of a PMLSM in the natural coordinate system, including the voltage equation, flux-linkage equation, electromagnetic thrust equation, and mechanical motion equation. Before the derivation, it is useful to explain the internal relationship between PMLSM and rotary PMSM from the perspective of structure and magnetic-field distribution.

To simplify the analysis, assume that the three-phase PMLSM is an ideal motor and satisfies the following conditions:

- Iron-core saturation is ignored.
- Eddy-current loss and hysteresis loss are ignored.
- The stator currents are balanced three-phase sinusoidal waves.
- The three phases are symmetrical, and the winding distribution is approximately sinusoidal.

### 1.0 Basic Structure of PMLSM and the Unfolded Equivalent Modeling Idea

Before building the mathematical model, it is necessary to clarify the correspondence between PMLSM and rotary PMSM from the perspective of structure and magnetic-field distribution. The following two figures show this mapping at two levels: geometric unfolding and the mechanism of traveling-wave magnetic-field formation.

---

#### (1) Unfolded Equivalence from Rotary PMSM to PMLSM

![Rotary PMSM unfolded into PMLSM](../assets/figure/2026-01-23/1.png)

The left side of Figure 1 is the cross-sectional structure of a typical rotary permanent magnet synchronous motor. Its air-gap magnetic field is distributed periodically along the circumferential direction. The right side is the linear structure obtained by unfolding the circumference along the tangential direction.

From the modeling perspective, this unfolded equivalence means:

- The circumferential coordinate \(\theta_m\) in rotary PMSM corresponds to the linear coordinate \(x\) in PMLSM.
- The angular periodicity along the circumference is transformed into spatial periodicity along the linear direction.

In rotary PMSM, the air-gap magnetic field along the circumferential direction can be expressed as:

$$
B(\theta_m) = B_m \cos(n_p \theta_m)
$$

After unfolding it along the circumference, the magnetic field is periodically distributed along the linear direction $x$ and can be equivalently expressed as:

$$
B(x) = B_m \cos\!\left( \frac{\pi}{\tau_p} x \right)
$$

where:

- \(\tau_p\) is the pole pitch, the distance from one N pole to one S pole.
- \(2\tau_p\) is the pole-pair pitch, corresponding to one complete electrical period.

Thus the core equivalent relationship is:

$$
\theta_m \;\longleftrightarrow\; x
$$

This correspondence is the fundamental basis that allows PMLSM mathematical modeling to reuse the coordinate transformations and dq-model form of PMSM directly.

---

#### (2) Mechanism of the Traveling-Wave Magnetic Field Produced by Three-Phase Windings

![Traveling-wave magnetic field](../assets/figure/2026-01-23/2.png)

Figure 2 shows how the three-phase stator windings of a PMLSM are distributed along the linear direction, and how they form a traveling-wave magnetic field under balanced three-phase sinusoidal current excitation.

In this structure:

- The stator windings are periodically arranged along the \(x\) direction.
- The winding phase sequence is usually arranged as \(A \rightarrow B \rightarrow C\) or an equivalent order.
- Each phase is supplied with balanced sinusoidal current shifted by \(120^\circ\).

The corresponding three-phase currents can be written as:

$$
\begin{cases}
i_A = I_m \cos(\omega_e t), \\
i_B = I_m \cos\!\left(\omega_e t - \frac{2\pi}{3}\right), \\
i_C = I_m \cos\!\left(\omega_e t + \frac{2\pi}{3}\right).
\end{cases}
$$

Because the physical positions of the windings also have equivalent electrical-angle shifts of \(120^\circ\) in space, the superposition of the three-phase magnetomotive forces along the linear direction forms a traveling magnetic field moving uniformly along \(x\).

The spatial phase of this traveling-wave magnetic field can be represented by an equivalent electrical angle:

$$
\theta_e(x) = \frac{\pi}{\tau_p} x
$$

Its propagation speed, or synchronous speed, is:

$$
v_s = \frac{\omega_e}{\pi/\tau_p}
$$

When the mover speed $v$ is consistent with the traveling-wave magnetic-field speed, the motor operates synchronously. This is the physical meaning of "synchronous" in the name PMLSM.

---

#### (3) Transition from Structure to Mathematical Model

From the analysis in Figures 1 and 2:

- PMLSM can be regarded structurally as the spatially unfolded form of rotary PMSM.
- The traveling-wave magnetic field generated by the three-phase windings still allows the system to introduce equivalent electrical angle and electrical angular speed:

$$
\theta_e = \frac{\pi}{\tau_p} x,
\qquad
\omega_e = \frac{\pi}{\tau_p} v
$$

Therefore, in the subsequent modeling:

- The forms of Clarke and Park coordinate transformations remain unchanged.
- The forms of the dq voltage equation and flux-linkage equation remain unchanged.
- Only the mechanical angular variable needs to be replaced by a linear displacement variable.

This structural-field-variable mapping forms the physical foundation of PMLSM mathematical modeling.

---

### 1.1 Three-Phase Voltage Equation

In the natural coordinate system \(ABC\), the stator voltage equation is:

$$
u_{3s} = R\,i_{3s} + \frac{d\psi_{3s}}{dt}
\tag{1}
$$

The form of this equation is exactly the same as that of rotary PMSM. The only difference appears in the definition of the position variable inside the flux-linkage expression: rotary motors use electrical angle \(\theta_e\), while linear motors use linear displacement \(x\) or the equivalent electrical angle \(\theta_e(x)\).

---

### 1.2 Flux-Linkage Equation

The flux-linkage equation can be written as:

$$
\psi_{3s} = L_{3s} i_{3s} + \psi_f\, F_{3s}\big(\theta_e(x)\big)
\tag{2}
$$

The permanent-magnet flux-linkage distribution function is:

$$
F_{3s}(\theta_e)=
\begin{bmatrix}
\cos \theta_e \\
\cos\!\left(\theta_e - \frac{2\pi}{3}\right) \\
\cos\!\left(\theta_e + \frac{2\pi}{3}\right)
\end{bmatrix}
$$

Establishing the equivalent electrical angle of the linear motor is the key step in the flux-linkage equation. Let \(\tau_p\) be the pole pitch, the distance from N pole to S pole. Then one pole-pair pitch is \(2\tau_p\). The electrical angle increases by \(2\pi\) over one pole-pair pitch, so:

$$
\theta_e(x) = \frac{\pi}{\tau_p}\,x
\quad\Rightarrow\quad
\omega_e = \frac{d\theta_e}{dt} = \frac{\pi}{\tau_p}\,v
\tag{3}
$$

Here $x$ is the position of the mover, or equivalent magnetic field, in the linear direction, and $v=\dot{x}$ is the linear speed.

In short: the electrical angle of rotary PMSM comes from rotor rotation angle, while the electrical angle of PMLSM comes from linear displacement.

---

### 1.3 Electromagnetic Thrust Equation

The electromagnetic torque of a rotary motor is derived by the energy method:

$$
T_e = \frac{\partial W'}{\partial \theta_m}
$$

The corresponding electromagnetic thrust of a linear motor is:

$$
F_e = \frac{\partial W'}{\partial x}
$$

Because \(\theta_e(x)=\frac{\pi}{\tau_p}x\), we have \(\frac{\partial}{\partial x}=\frac{\pi}{\tau_p}\frac{\partial}{\partial \theta_e}\).

In the dq coordinate system, the electromagnetic thrust expression of PMLSM has a one-to-one correspondence with the torque expression of PMSM:

$$
F_e = \frac{3}{2}\,\frac{\pi}{\tau_p}
\left[
\psi_f i_q + (L_d - L_q) i_d i_q
\right]
\tag{4}
$$

For a surface-mounted structure or a motor with weak saliency, \(L_d=L_q\) can be approximately used. The thrust expression then simplifies to:

$$
F_e = \frac{3}{2}\,\frac{\pi}{\tau_p}\,\psi_f i_q
\tag{5}
$$

From the expression, the electromagnetic part inside the brackets, \(\psi_f i_q + (L_d-L_q)i_di_q\), has exactly the same structure as rotary PMSM. The difference is that the external coefficient changes from the pole-pair number \(n_p\) to the spatial wave number \(\pi/\tau_p\):

- Rotary motor: \(\theta_e=n_p\theta_m\Rightarrow \partial/\partial \theta_m = n_p\,\partial/\partial \theta_e\)
- Linear motor: \(\theta_e=(\pi/\tau_p)x\Rightarrow \partial/\partial x = (\pi/\tau_p)\,\partial/\partial \theta_e\)

---

### 1.4 Mechanical Motion Equation

The mechanical equation of a rotary PMSM is:

$$
J\dot{\omega}_m = T_e - T_L - B\omega_m
$$

The motion equation of a linear PMLSM is directly expressed by mass and linear speed:

$$
m\frac{dv}{dt} = F_e - F_L - B\,v
\tag{6}
$$

where:

- \(m\): equivalent mass, including mover and reflected load
- \(F_L\): load force, including slope, friction, external disturbance, and so on
- \(B\): viscous damping coefficient

---

## 2. Coordinate Transformation of PMLSM

The three-phase winding of a linear motor is still an \(ABC\) three-phase system, so the form of coordinate transformation remains unchanged:

- Clarke transformation: \(ABC \rightarrow \alpha\beta\)
- Park transformation: \(\alpha\beta \rightarrow dq\)

The only difference from rotary PMSM is that the angle input of the Park transformation no longer comes from the rotor angle sensor's \(\theta_e(t)\). Instead, it comes from the position \(x(t)\):

$$
\theta_e(t)=\theta_e(x(t))=\frac{\pi}{\tau_p}x(t)
\tag{7}
$$

At the control-implementation level, rotary motors usually use encoders to obtain angle information. Linear motors use linear encoders, optical scales, magnetic scales, or observers to estimate position $x$.

The concrete forms of the Clarke and Park transformation matrices can be reused directly from the standard definitions used in PMSM modeling.

---

## 3. Mathematical Model of PMLSM in the dq Coordinate System

This section gives the voltage and flux-linkage equations of a PMLSM in the dq synchronous rotating coordinate system. The model form is almost identical to that of rotary PMSM; the only difference is the definition of electrical angular speed.

### 3.1 dq Voltage Equation

$$
\begin{cases}
u_d = R\,i_d + \dfrac{d\psi_d}{dt} - \omega_e\,\psi_q, \\
u_q = R\,i_q + \dfrac{d\psi_q}{dt} + \omega_e\,\psi_d.
\end{cases}
\tag{8}
$$

The electrical angular speed is defined as:

$$
\omega_e = \frac{\pi}{\tau_p}v
\tag{9}
$$

### 3.2 Flux-Linkage Equation

$$
\begin{cases}
\psi_d = L_d\, i_d + \psi_f, \\
\psi_q = L_q\, i_q.
\end{cases}
\tag{10}
$$

Substituting the flux-linkage equations into the voltage equations gives the combined form:

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
\end{bmatrix}
+
\frac{d}{dt}
\begin{bmatrix}
L_d & 0 \\ 0 & L_q
\end{bmatrix}
\begin{bmatrix}
i_d \\ i_q
\end{bmatrix}
+
\begin{bmatrix}
0 \\ \omega_e \psi_f
\end{bmatrix}
\tag{11}
$$

Thus, apart from replacing \(\omega_e\) with \((\pi/\tau_p)v\), the dq electromagnetic model of PMLSM has exactly the same structure as that of rotary PMSM.

---

## 4. Variable Correspondence with Rotary PMSM

Replacing variables in rotary PMSM according to the following table gives the corresponding form for linear PMLSM:

| Rotary PMSM | Linear PMLSM | Physical meaning |
| ----------- | ------------ | ---------------- |
| Mechanical angle \(\theta_m\) | Linear displacement \(x\) | Degree of freedom changes from rotation to translation |
| Mechanical angular speed \(\omega_m\) | Linear speed \(v=\dot{x}\) | Speed definition changes |
| Electrical angle \(\theta_e=n_p\theta_m\) | \(\theta_e=\frac{\pi}{\tau_p}x\) | Electrical angle comes from spatial periodicity |
| Electrical angular speed \(\omega_e=n_p\omega_m\) | \(\omega_e=\frac{\pi}{\tau_p}v\) | Direct mapping from speed |
| Electromagnetic torque \(T_e\) | Electromagnetic thrust \(F_e\) | Output physical quantity changes |
| Rotational inertia \(J\) | Mass \(m\) | Mechanical equation equivalence |
| Load torque \(T_L\) | Load force \(F_L\) | External disturbance term changes |

---

## 5. Disturbance Terms Unique to Linear Motors

The modeling above treats PMLSM as the spatially unfolded form of rotary PMSM. Under ideal assumptions, their electromagnetic equations are highly isomorphic. However, because linear motors have an open structure, they contain several disturbance characteristics that rotary motors do not have. This section discusses end effects, cogging force, thrust ripple, and normal force. These factors cannot be ignored in high-precision positioning and smooth-motion applications.

### 5.1 End Effect

End effect is one of the essential characteristics that distinguishes linear motors from rotary motors. In a rotary motor, both stator and rotor are closed structures, and the magnetic circuit is continuous along the circumference. In a linear motor, the primary side or secondary side has physical boundaries along the travel direction, which causes the magnetic field to change abruptly near the ends.

According to its mechanism, end effect can be divided into two types.

**(1) Longitudinal end effect**

When the primary length is finite, the primary iron core forms magnetic-circuit discontinuities at both ends. As the traveling magnetic field enters and leaves the primary region, the magnetic flux path changes abruptly, causing:

- The air-gap magnetic field distribution along the travel direction to become nonuniform and deviate from the ideal sinusoidal assumption.
- Different thrust components to appear at the entry and exit ends, forming additional braking force related to speed.
- Abrupt magnetic-field changes in the end region to induce additional eddy-current loss, reducing motor efficiency.
- Periodic thrust fluctuation to appear near the ends, affecting motion smoothness.

For a short-primary long-secondary structure, such as a moving-coil structure, this effect is relatively fixed. For a long-primary short-secondary structure, such as a moving-magnet structure, the end effect changes with mover position and its influence is more complex.

**(2) Transverse edge effect**

When the primary or secondary has finite width perpendicular to the motion direction, the magnetic field leaks and changes at the lateral edges. This effect causes:

- Reduced effective air-gap magnetic field
- Decreased thrust constant
- Uneven magnetic attraction in edge regions

The influence of transverse edge effect is closely related to the motor's width-length ratio and air-gap size.

---

### 5.2 Cogging Force

Cogging force is a position-dependent disturbance force produced by the interaction between permanent magnets and stator slots. Its mechanism is the same as cogging torque in rotary motors, but in a linear motor it appears as periodic thrust fluctuation along the motion direction.

Cogging force can be expressed as a periodic function of displacement:

$$
F_{cog}(x) = \sum_{k=1}^{\infty} F_k \sin\!\left( \frac{2\pi k}{\tau_{cog}} x + \phi_k \right)
\tag{12}
$$

Here \(\tau_{cog}\) is the spatial period of cogging force, related to the least common multiple of pole pitch and slot pitch.

The characteristics of cogging force include:

- It is independent of load current and still exists at zero current.
- Its period is determined by the geometric relationship between pole pitch and slot pitch.
- It significantly affects positioning accuracy during low-speed operation.

In engineering, skewed slots, fractional-slot windings, and magnet shifting are often used to weaken cogging force.

---

### 5.3 Thrust Ripple

In addition to cogging force, a PMLSM also has current-related thrust ripple during energized operation. Its main sources include:

- Interaction between current harmonics and back-EMF harmonics
- Flux-linkage harmonics caused by nonsinusoidal magnetic-field distribution
- Inverter dead-time effect and switching harmonics

Thrust ripple can be decomposed into periodic components related to electrical angle:

$$
F_{ripple}(\theta_e) = \sum_{n} F_n \cos(n\theta_e + \varphi_n)
\tag{13}
$$

In a linear motor, \(\theta_e = (\pi/\tau_p)x\), so thrust ripple appears as a periodic disturbance of spatial position, and its frequency changes with operating speed.

---

### 5.4 Normal Force and Guiding Force

When a linear motor produces tangential thrust, the air-gap magnetic field also produces normal attraction force. For a flat-plate PMLSM, the normal force appears as attraction between the primary and secondary.

The magnitude of normal force is usually several times to more than ten times the tangential thrust. Its characteristics include:

- Average component: produced by magnetic attraction between permanent magnets and iron core, independent of current.
- Ripple component: position-dependent, with a period similar to cogging force.

Normal force itself does not perform mechanical work, but it creates load on the guide mechanism and affects the system's mechanical design and dynamic performance. In U-shaped or double-sided structures, symmetrical arrangement can be used to cancel normal forces against each other.

---

### 5.5 Modeling Treatment of Disturbance Terms

In actual control-system design, the disturbance terms above can be grouped into a lumped disturbance force \(F_d\). The mechanical equation is then modified as:

$$
m\frac{dv}{dt} = F_e - F_L - B\,v - F_d
\tag{14}
$$

Here \(F_d\) includes thrust fluctuation caused by end effect, cogging force, thrust ripple, and other components.

The treatment strategies for disturbance terms usually include:

- **Feedforward compensation:** Build a mapping table between disturbance force and position based on offline calibration or finite-element simulation, then apply feedforward cancellation.
- **Observer estimation:** Use an extended state observer (ESO) or disturbance observer (DOB) to estimate and compensate online.
- **Structural optimization:** Reduce disturbance sources from the motor body design level.

For high-precision servo applications, modeling and compensating these disturbance terms is a key part of achieving smooth operation.

---

## 6. Summary

- **Electromagnetic side (ABC/alpha-beta/dq):** PMLSM and PMSM have highly isomorphic equation forms, and the Clarke/Park transformation matrices can be reused directly.
- **Mechanical side (output and dynamics):** Torque \(T\), inertia \(J\), and angular speed \(\omega\) become thrust \(F\), mass \(m\), and linear speed \(v\).
- **Unique quantity of linear motors:** Pole pitch \(\tau_p\), or pole-pair pitch \(2\tau_p\), determines the equivalent electrical angle \(\theta_e(x)\) and electrical angular speed \(\omega_e(v)\), and appears in the thrust coefficient \(\pi/\tau_p\).
- **Control level:** After understanding FOC for PMSM, implementing FOC for PMLSM is essentially replacing the angle source with position, and replacing the torque loop with thrust, speed, or position loops.
