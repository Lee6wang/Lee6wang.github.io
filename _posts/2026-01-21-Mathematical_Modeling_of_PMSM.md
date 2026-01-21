---
title: "永磁同步电机的数学建模"
date: 2026-01-21 14:00:00 +0800
categories: [Motor Control, Engineering]
tags: [PMSM]
math: true
---

# 永磁同步电机的数学建模

## 写在前面

本文是为了记录个人学习的一个笔记，学习内容参考**现代永磁同步电机控制原理及MATLAB仿真__袁雷编著**

## 一、三相PMSM的基本数学模型

为了简化分析，假设三相PMSM为理想电机，且满足下列条件

- 忽略电机铁芯的饱和
- 不计电机中的涡流喝磁滞损耗
- 典籍中的电流为对称的三相正弦波电流

可以列出自然坐标系下的PMSM的三相电压方程为

$$
u_3s = Ri_3s + \frac{d}{dt}{\psi}_3s
$$

磁链方程为

$$
{\psi} = L_{3s}i_{3s} + {\psi}_{f}{\cdot}F_{3s}({\theta_e})
$$

其中：${\psi}_3s$是三相绕组的磁链；$u_{3s}、R、i_{3s}$分别是三相绕组的相电压、电阻和电流；$L_{3s}$为三相绕组的电感；$F_{3s}({\theta_e})$为三相绕组的磁链，且满足

$$
i_{3s} = 
\begin{bmatrix}
i_A\\
i_B\\
i_C
\end{bmatrix},
R_3s =
\begin{bmatrix}
R & 0 & 0\\
0 & R & 0\\
0 & 0 & R
\end{bmatrix},
{\psi}_3s =
\begin{bmatrix}
{\psi}_A\\
{\psi}_B\\
{\psi}_C
\end{bmatrix},
u_3s =
\begin{bmatrix}
u_A\\
u_B\\
u_C
\end{bmatrix}
F_{3s}({\theta_e}) =
\begin{bmatrix}
\cos({\theta_e})\\
\cos({\theta_e} - \frac{2{\pi}}{3})\\
\cos({\theta_e} + \frac{2{\pi}}{3})
\end{bmatrix}
$$
$$
L_{3s} = L_m3
\begin{bmatrix}
1 & cos({\frac{2{\pi}}{3}}) & cos({\frac{4{\pi}}{3}})\\
cos({\frac{2{\pi}}{3}}) & 1 & cos({\frac{2{\pi}}{3}})\\
cos({\frac{4{\pi}}{3}}) & cos({\frac{2{\pi}}{3}}) & 1
\end{bmatrix} + L_{\sigma}3
\begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1
\end{bmatrix}
$$

其中：$L_m3$为三相绕组的定子互感，$L_{\sigma}3$为三相绕组的定子漏感。
根据机电能量转换原理，电磁转矩$T_e$等于磁场储能对机械角${\theta_m}$的偏导数，因此有
$$
T_e = \frac{1}{2} p_n \frac{\partial}{\partial \theta_m}
\left( \dot{i}_{3s}^{\mathrm{T}} \cdot \psi_{3s} \right)
$$
其中：$p_n$为电机的极对数。
另外，电机的机械运动方程为：

$$
J \frac{d\omega_m}{dt} = T_e - T_L - B \omega_m
$$
其中，：$J$为电机转动惯量，$\omega_m$为电机机械角速度，$T_L$为负载转矩，$B$为粘性摩擦系数。

## 二、PMSM的坐标变换

为了简化PMSM的数学模型分析，通常采用坐标变换的方法将三相静止坐标系下的电机数学模型转换为两相旋转坐标系下的电机数学模型。常用的坐标变换方法有Clarke变换和Park变换。

![1](../assets/figure/2026-01-21/1.png)

如上图所示，$ABC$ 为自然坐标系，$\alpha-\beta$为两相静止坐标系，$d-q$为两相旋转坐标系。

### 2.1 Clarke变换

Clark变换是将三相坐标系 $ABC$ 下的电机数学模型转换为两相静止坐标系 $\alpha-\beta$ 下的电机数学模型。Clark变换矩为：

$$
\begin{bmatrix}
f_\alpha \\
f_\beta \\
f_0
\end{bmatrix}=
T_{3s/2s}
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix}
$$
其中：$f$代表电机的电压、电流或磁链，$f_0$为零序分量，$T_{3s/2s}$为Clark变换矩阵，定义为：
$$
T_{3s/2s} = \frac{2}{3}
\begin{bmatrix}
1 & -\frac{1}{2} & -\frac{1}{2} \\
0 & \frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} \\
\frac{1}{2} & \frac{1}{2} & \frac{1}{2}
\end{bmatrix}
$$
将静止坐标系 $\alpha-\beta$ 变换到自然坐标系 $ABC$ 的坐标变换称为反 Clark 变换，可以表示为：
$$
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix}=
T_{2s/3s}
\begin{bmatrix}
f_\alpha \\
f_\beta \\
f_0
\end{bmatrix}
$$
其中，$T_{2s/3s}$为反Clark变换矩阵，定义为：
$$
T_{2s/3s} =
T_{3s/2s}^{-1} =
\begin{bmatrix}
1 & 0 & \dfrac{\sqrt{2}}{2} \\
-\dfrac{1}{2} & \dfrac{\sqrt{3}}{2} & \dfrac{\sqrt{2}}{2} \\
-\dfrac{1}{2} & -\dfrac{\sqrt{3}}{2} & \dfrac{\sqrt{2}}{2}
\end{bmatrix}
$$

以上简单分析了自然坐标系中的变量与静止坐标系中的变量之间的关系，变换矩阵前的系数为 2 /3 ，是根据幅值不变作为约束条件得到的；当采用功率不变作为约束条件时，该系数变为 $\sqrt{2/3}$。
对于三相对称系统而言，在计算静止坐标系下的变量时，零序分量$f_0$为零，因此在实际应用中，通常忽略零序分量。

### 2.2 Park变换

Park变换是将两相静止坐标系 $\alpha-\beta$ 下的电机数学模型转换为两相旋转坐标系 $d-q$ 下的电机数学模型。Park变换为：
$$
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix} =
T_{2s/2r}
\begin{bmatrix}
f_\alpha \\
f_\beta
\end{bmatrix}
$$
其中：$T_{2s/2r}$为Park变换矩阵，定义为：
$$
T_{2s/2r} =
\begin{bmatrix}
\cos{\theta_e} & \sin{\theta_e} \\
-\sin{\theta_e} & \cos{\theta_e}
\end{bmatrix}
$$
将旋转坐标系 $d-q$ 变换到静止坐标系 $\alpha-\beta$ 的坐标变换称为反 Park 变换，可以表示为：
$$
\begin{bmatrix}
f_\alpha \\
f_\beta
\end{bmatrix} =
T_{2r/2s}
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix}
$$
其中，$T_{2r/2s}$为反Park变换矩阵，定义为：
$$
T_{2r/2s} =
T_{2s/2r}^{-1} =
\begin{bmatrix}
\cos{\theta_e} & -\sin{\theta_e} \\
\sin{\theta_e} & \cos{\theta_e}
\end{bmatrix}
$$

### 2.3 综合变换矩阵
将Clark变换和Park变换结合起来，可以得到从自然坐标系 $ABC$ 变换到旋转坐标系 $d-q$ 的综合变换矩阵。该变换可以表示为：
$$
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix} =
T_{3s/2r}
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix}
$$
其中，$T_{3s/2r}$为综合变换矩阵，定义为：
$$
T_{3s/2r} =
T_{2s/2r} \cdot T_{3s/2s} =
\frac{2}{3}
\begin{bmatrix}
\cos{\theta_e} & \cos{(\theta_e - \frac{2\pi}{3})} & \cos{(\theta_e + \frac{2\pi}{3})} \\
\sin{\theta_e} & \sin{(\theta_e - \frac{2\pi}{3})} & \sin{(\theta_e + \frac{2\pi}{3})}
\end{bmatrix}
$$
将旋转坐标系 $d-q$ 变换到自然坐标系 $ABC$ 的综合反变换矩阵可以表示为：
$$
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix} =
T_{2r/2s} \cdot T_{2s/3s}
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix}
$$
其中，$T_{2r/3s}$为综合反变换矩阵，定义为：
$$
T_{2r/3s} =
T_{2s/3s} \cdot T_{2r/2s} =
\begin{bmatrix}
\cos{\theta_e} & -\sin{\theta_e} \\
\cos{(\theta_e - \frac{2\pi}{3})} & -\sin{(\theta_e - \frac{2\pi}{3})} \\
\cos{(\theta_e + \frac{2\pi}{3})} & -\sin{(\theta_e + \frac{2\pi}{3})}
\end{bmatrix}
$$

### 2.4 MATLAB坐标系与理论坐标系的区别

在MATLAB中，通常使用的是以d轴为参考的坐标系，而理论推导中使用的坐标系可能有所不同。在MATLAB仿真中，需要特别注意坐标变换的方向和角度的定义，以确保仿真结果与理论分析一致。
MATLAB 自身使用的坐标变换矩阵与书本上介绍的变换矩阵并不相同，实际上两者之间相差 **90° 电角度**。
![2](../assets/figure/2026-01-21/2.png)
上图为Matlab所使用坐标系，对比可以发现，两者具有如下关系
$$
\begin{bmatrix}
f_{\alpha'} \\
f_{\beta'}
\end{bmatrix} = 
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
\begin{bmatrix}
f_\alpha \\
f_\beta
\end{bmatrix};
\begin{bmatrix}
f_{d'} \\
f_{q'}
\end{bmatrix} = 
\begin{bmatrix}
0 & -1 \\
1 & 0
\end{bmatrix}
\begin{bmatrix}
f_d \\
f_q
\end{bmatrix}
$$
忽略零序分量后，将自然坐标系 $ABC$ 下的变量变换到静止坐标系 $\alpha'-\beta'$ 的坐标变换矩阵为：
$$
\begin{bmatrix}
f_\alpha' \\
f_\beta'
\end{bmatrix} =
T_{3s/2s}'
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix}
$$
其中，$T_{3s/2s}'$为Matlab中的Clarke变换矩阵，定义为：
$$
T_{3s/2s}' =
\frac{2}{3}
\begin{bmatrix}
-\frac{1}{2} & -\frac{1}{2} & 1 \\
\frac{\sqrt{3}}{2} & -\frac{\sqrt{3}}{2} & 0
\end{bmatrix}
$$
将静止坐标系 $\alpha'-\beta'$ 变换到同步旋转坐标系 $d'-q'$ 的变换可以表示为：
$$
\begin{bmatrix}
f_{d'} \\
f_{q'}
\end{bmatrix} =
T_{2s/2r}'
\begin{bmatrix}
f_\alpha' \\
f_\beta'
\end{bmatrix}
$$
其中：$T_{2s/2r}'$为Matlab中的Park变换矩阵，定义为：
$$
T_{2s/2r}' =
\begin{bmatrix}
\sin{\theta_e} & -\cos{\theta_e} \\
\cos{\theta_e} & \sin{\theta_e}
\end{bmatrix}
$$
将自然坐标系 $ABC$ 下的变量变换到同步旋转坐标系 $d'-q'$ 的综合变换矩阵为：
$$
\begin{bmatrix}
f_{d'} \\  
f_{q'}
\end{bmatrix} =
T_{3s/2r}'
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix}
$$
其中，$T_{3s/2r}'$为Matlab中的综合变换矩阵，定义为：
$$
T_{3s/2r}' =
\frac{2}{3}
\begin{bmatrix}
\sin{\theta_e} & \sin{(\theta_e - \frac{2\pi}{3})} & \sin{(\theta_e + \frac{2\pi}{3})} \\
-\cos{\theta_e} & -\cos{(\theta_e - \frac{2\pi}{3})} & -\cos{(\theta_e + \frac{2\pi}{3})}
\end{bmatrix}
$$
将旋转坐标系 $d'-q'$ 变换到自然坐标系 $ABC$ 的综合反变换矩阵可以表示为：
$$
\begin{bmatrix}
f_A \\
f_B \\
f_C
\end{bmatrix} =
T_{2r/3s}'
\begin{bmatrix}
f_{d'} \\
f_{q'}
\end{bmatrix}
$$
其中，$T_{2r/3s}'$为Matlab中的综合反变换矩阵，定义为：
$$
T_{2r/3s}' =
\begin{bmatrix}
\sin{\theta_e} & -\cos{\theta_e} \\
\sin{(\theta_e - \frac{2\pi}{3})} & -\cos{(\theta_e - \frac{2\pi}{3})} \\
\sin{(\theta_e + \frac{2\pi}{3})} & -\cos{(\theta_e + \frac{2\pi}{3})}
\end{bmatrix}
$$