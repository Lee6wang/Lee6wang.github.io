# Basic Notes on Bandwidth from a PMSM FOC Perspective

## 1. What Bandwidth Is

Bandwidth is a frequency-domain metric used to describe the frequency range over which a system can effectively respond to input changes.

- Larger bandwidth: faster response and more agile tracking
- Smaller bandwidth: slower response and better tracking only for low-frequency changes

Therefore, bandwidth can be understood as the frequency-domain expression of how "fast" or "slow" a system is.

------

## 2. The -3 dB Definition and General Solution Method

For a transfer function $H(s)$, let $s=j\omega$ to obtain the frequency response $H(j\omega)$, whose magnitude is:

$$
|H(j\omega)|
$$

If the low-frequency gain is $|H(j0)|$, the bandwidth $\omega_B$ is usually defined as:

$$
|H(j\omega_B)|=\frac{|H(j0)|}{\sqrt{2}}
$$

If the low-frequency gain is 1, this simplifies to:

$$
|H(j\omega_B)|=\frac{1}{\sqrt{2}}
$$

This is the commonly mentioned -3 dB bandwidth. When the magnitude becomes $1/\sqrt{2}$, the power becomes half of the original value:

$$
\left(\frac{1}{\sqrt{2}}\right)^2=\frac{1}{2}
$$

### General Steps

1. Write $H(s)$
2. Let $s=j\omega$ to obtain $H(j\omega)$
3. Compute $|H(j\omega)|$
4. Write the -3 dB condition
5. Solve $\omega_B$ and, if needed, convert with $f_B=\omega_B/(2\pi)$

------

## 3. Bandwidth of First-Order and Second-Order Systems

### 3.1 First-Order System

A standard first-order system:

$$
H(s)=\frac{1}{Ts+1}
$$

Its magnitude is:

$$
|H(j\omega)|=\frac{1}{\sqrt{1+(\omega T)^2}}
$$

Substituting the -3 dB condition gives:

$$
\omega_B=\frac{1}{T},\quad f_B=\frac{1}{2\pi T}
$$

Conclusion: the smaller $T$ is, the larger the bandwidth and the faster the system.

### 3.2 Second-Order System

A standard second-order system:

$$
H(s)=\frac{\omega_n^2}{s^2+2\zeta\omega_n s+\omega_n^2}
$$

Its magnitude is:

$$
|H(j\omega)|=\frac{\omega_n^2}{\sqrt{(\omega_n^2-\omega^2)^2+(2\zeta\omega_n\omega)^2}}
$$

If the low-frequency gain is 1, the -3 dB bandwidth satisfies:

$$
\omega_B=\omega_n\sqrt{1-2\zeta^2+\sqrt{2-4\zeta^2+4\zeta^4}}
$$

In the common engineering range $\zeta=0.5\sim0.8$, the approximation is often used:

$$
\omega_B\approx\omega_n
$$

But this is an approximation, not strict equality.

------

## 4. Bandwidth, Crossover Frequency, and Time-Domain Performance

The open-loop gain crossover frequency is defined as:

$$
|L(j\omega_c)|=1
$$

The closed-loop bandwidth is defined as:

$$
|T(j\omega_B)|=\frac{1}{\sqrt{2}}
$$

In many conventional systems, it is common to have:

$$
\omega_B\approx\omega_c
$$

In addition, bandwidth is usually negatively related to rise time in the time domain:

$$
t_r\propto\frac{1}{\omega_B}
$$

Increasing bandwidth usually improves response speed and disturbance rejection speed, but it may also reduce stability margin and increase noise sensitivity.

------

## 5. How to Understand Bandwidth in PMSM FOC

Although PMSM FOC contains many modules - PI controllers, coordinate transforms, SVPWM, inverter, motor, sampling, and so on - it is still essentially a dynamic closed-loop system, so bandwidth can be discussed.

In engineering, we do not talk about one "overall bandwidth." We discuss bandwidth by loop:

- Current-loop bandwidth
- Speed-loop bandwidth
- Optional position-loop bandwidth

### 5.1 Current Loop

Take the q-axis as an example: input $i_q^*$, output $i_q$, and the closed-loop transfer function can be written as:

$$
T_{iq}(s)=\frac{i_q(s)}{i_q^*(s)}
$$

Bandwidth definition:

$$
|T_{iq}(j\omega_{Bi})|=\frac{|T_{iq}(j0)|}{\sqrt{2}}
$$

In the $dq$ frame, after ignoring or compensating coupling, each axis is approximately:

$$
u=Ri+L\frac{di}{dt},\quad G_i(s)=\frac{1}{Ls+R}
$$

Therefore, the current loop can be approximately analyzed as a "first-order plant + PI." Its physical meaning is how fast current, and therefore torque, is established.

### 5.2 Speed Loop

The input and output of the speed loop are $\omega^*\to\omega$, and the closed-loop transfer function can be written as:

$$
T_\omega(s)=\frac{\omega(s)}{\omega^*(s)}
$$

Bandwidth definition:

$$
|T_\omega(j\omega_{B\omega})|=\frac{|T_\omega(j0)|}{\sqrt{2}}
$$

When the current loop is fast enough, approximate $i_q\approx i_q^*$, and:

$$
T_e=K_t i_q,\quad J\frac{d\omega}{dt}=T_e-T_L-B\omega
$$

Then the speed-loop plant is approximately:

$$
G_\omega(s)=\frac{\omega(s)}{i_q(s)}=\frac{K_t}{Js+B}
$$

Its physical meaning is speed tracking and disturbance recovery speed.

### 5.3 Cascaded Bandwidth Configuration

FOC is a cascaded structure:

$$
\omega^*\rightarrow\text{Speed PI}\rightarrow i_q^*\rightarrow\text{Current PI}\rightarrow u_q\rightarrow\text{Motor}
$$

To make the outer-loop design valid, we usually require:

$$
\omega_{Bi}\gg\omega_{B\omega}
$$

A common empirical rule is:

$$
\omega_{Bi}=5\sim10\times\omega_{B\omega}
$$

That is: "inner loop fast, outer loop slow."

------

## 6. The Value and Upper Limit of Bandwidth

Bandwidth determines not only tracking speed, but also disturbance rejection ability. For example, when a load disturbance $T_L$ appears in the speed loop, the larger the bandwidth, the faster the recovery usually is.

But bandwidth cannot be increased without limit. Common limitations include:

1. Sampling frequency limit
2. PWM and actuator-chain delay
3. Computational delay
4. Parameter uncertainty
5. Voltage/current saturation
6. Unmodeled dynamics such as dead time, quantization, and noise

Therefore, engineering design must compromise between "response speed" and "stability robustness."

------

## 7. Summary

- The essence of bandwidth definition is the -3 dB frequency
- In a first-order system, $\omega_B=1/T$
- In a second-order system, $\omega_B$ is jointly determined by $\omega_n,\zeta$
- PMSM FOC should design bandwidth by loop, rather than pursuing a single "overall bandwidth"
- Cascaded systems follow "current loop fast, speed loop slow," often configured with a 5 to 10 times ratio
- Larger bandwidth is not always better; stability, noise, and hardware constraints must be considered together
