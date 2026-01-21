---
title: "永磁同步电机的数学建模"
date: 2026-01-21 14:00:00 +0800
categories: [Motor Control, Engineering]
tags: [PMSM]
math: true
---

# 永磁同步电机的数学建模

## 写在前面

本文为个人学习笔记，主要参考文献为  
**《现代永磁同步电机控制原理及 MATLAB 仿真》—— 袁雷 编著**。
由于组里做的方向和电机相关，后续会写很多与电机相关的东西，无论是DSP 控制，还是电机控制算法设计，都离不开对电机数学模型的理解，所以先把数学模型的内容整理出来，方便后续查阅。

---

## 一、三相 PMSM 的基本数学模型

为简化分析，假设三相 PMSM 为理想电机，并满足以下条件：

- 忽略电机铁芯饱和
- 不计涡流和磁滞损耗
- 定子电流为对称三相正弦波

### 1.1 三相电压方程

在自然坐标系（\(ABC\)）下，三相 PMSM 的电压方程为：

$$
u_{3s} = R\,i_{3s} + \frac{d\psi_{3s}}{dt}
$$

### 1.2 磁链方程

磁链方程表示为：

$$
\psi_{3s} = L_{3s} i_{3s} + \psi_f\, F_{3s}(\theta_e)
$$

其中各变量定义如下：

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

永磁体磁链分布函数为：

$$
F_{3s}(\theta_e) =
\begin{bmatrix}
\cos \theta_e \\
\cos\!\left(\theta_e - \frac{2\pi}{3}\right) \\
\cos\!\left(\theta_e + \frac{2\pi}{3}\right)
\end{bmatrix}
$$

定子电感矩阵为：

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

其中：  
\(L_{m3}\) 为三相定子互感，\(L_{\sigma 3}\) 为定子漏感。

---

### 1.3 电磁转矩方程

根据机电能量转换原理，电磁转矩等于磁共能对机械角的偏导数：

$$
T_e =
\frac{p_n}{2}
\frac{\partial}{\partial \theta_m}
\left(
i_{3s}^{\mathrm{T}} \psi_{3s}
\right)
$$

其中 \(p_n\) 为电机极对数。

---

### 1.4 机械运动方程

电机的机械运动方程为：

$$
J \frac{d\omega_m}{dt} =
T_e - T_L - B\,\omega_m
$$

其中：

- \(J\)：转动惯量  
- \(\omega_m\)：机械角速度  
- \(T_L\)：负载转矩  
- \(B\)：粘性阻尼系数  

---

## 二、PMSM 的坐标变换

为简化数学模型，通常采用坐标变换方法，将三相静止坐标系下的模型转换到两相旋转坐标系。

![1](../assets/figure/2026-01-21/1.png)

其中：  
\(ABC\) 为自然坐标系，\(\alpha\beta\) 为两相静止坐标系，\(dq\) 为同步旋转坐标系。

---

### 2.1 Clarke 变换

Clarke 变换用于将三相坐标系变量变换到两相静止坐标系：

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
$$

其中：

$$
T_{3s/2s} =
\frac{2}{3}
\begin{bmatrix}
1 & -\frac{1}{2} & -\frac{1}{2} \\
0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \\
\frac{1}{2} & \frac{1}{2} & \frac{1}{2}
\end{bmatrix}
$$

反 Clarke 变换为：

$$
\begin{bmatrix}
f_A \\ f_B \\ f_C
\end{bmatrix} =
T_{2s/3s}
\begin{bmatrix}
f_\alpha \\ f_\beta \\ f_0
\end{bmatrix}
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

### 2.2 Park 变换

Park 变换将 \(\alpha\beta\) 坐标系变量变换到旋转坐标系：

$$
\begin{bmatrix}
f_d \\ f_q
\end{bmatrix} =
T_{2s/2r}
\begin{bmatrix}
f_\alpha \\ f_\beta
\end{bmatrix}
$$

$$
T_{2s/2r} =
\begin{bmatrix}
\cos \theta_e & \sin \theta_e \\
-\sin \theta_e & \cos \theta_e
\end{bmatrix}
$$

反 Park 变换为：

$$
T_{2r/2s} =
\begin{bmatrix}
\cos \theta_e & -\sin \theta_e \\
\sin \theta_e & \cos \theta_e
\end{bmatrix}
$$

---

### 2.3 综合坐标变换

综合 Clarke 与 Park 变换，有：

$$
\begin{bmatrix}
f_d \\ f_q
\end{bmatrix} =
T_{3s/2r}
\begin{bmatrix}
f_A \\ f_B \\ f_C
\end{bmatrix}
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

### 2.4 MATLAB 坐标系与理论坐标系的差异

MATLAB 中采用的坐标系与理论推导相比相差 **90° 电角度**：

![2](../assets/figure/2026-01-21/2.png)

其关系为：

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

对应的 MATLAB Clarke 与 Park 变换矩阵分别为：

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

## 三、PMSM 在 \(dq\) 坐标系下的数学模型

可列出 PMSM 在 \(dq\) 坐标系下的数学模型，其用定子电压方程可表示为：
$$
\begin{cases}
u_d = R\,i_d + \dfrac{d\psi_d}{dt} - \omega_e\,\psi_q, \\
u_q = R\,i_q + \dfrac{d\psi_q}{dt} + \omega_e\,\psi_d.
\end{cases}
$$
定子磁链方程为
$$
\begin{cases}
\psi_d = L_d\, i_d + \psi_f, \\
\psi_q = L_q\, i_q.
\end{cases}
$$
将两式合并可得：
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
$$
其中:$u_d, u_q$ 为定子电压 ($dq$ 坐标系)；$i_d, i_q$ 为定子电流($dq$ 坐标系)；$\psi_d, \psi_q$ 为磁链；$\omega_e$ 为电角速度。$L_d, L_q$ 分别为定子 $d$ 轴和 $q$ 轴电感；$\psi_f$ 为永磁体磁链。

![3](../assets/figure/2026-01-21/3.png)
根据上式可得出点压等效电路如上图所示，此时电磁转矩方程为：
$$
T_e = \frac{3}{2} p_n \left[ \psi_f i_q + (L_d - L_q) i_d i_q \right]
$$
其中：$p_n$ 为电机极对数。
对于表贴式永磁同步电机，$L_d = L_q$，则电磁转矩方程简化为：
$$
T_e = \frac{3}{2} p_n \psi_f i_q
$$
同时在仿真时，有几个重要的关系式：
$$
\begin{cases}
\omega_e = n_p\,\omega_m, \\[4pt]
N_r = \dfrac{30}{\pi}\,\omega_m, \\[6pt]
\theta_e = \displaystyle \int \omega_e \, dt.
\end{cases}
$$
其中：$n_p$ 为电机极对数，$N_r$ 为转速（单位：rpm），$\omega_m$ 为机械角速度（单位：rad/s），$\theta_e$ 为电机电角度。

## 四、总结

本文介绍了永磁同步电机的基本数学模型及其在 \(dq\) 坐标系下的表达形式。通过坐标变换，简化了电压方程和磁链方程，为后续的控制策略设计奠定了基础。理解这些数学模型对于实现高效的电机控制至关重要。