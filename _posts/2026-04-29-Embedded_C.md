---
title: "嵌入式 C 语言关键词理解：从 static 到 volatile，真正影响工程稳定性的细节"
title_en: "Understanding Embedded C Keywords: From static to volatile and the Details That Affect Engineering Stability"
date: 2026-04-29 00:00:00 +0800
categories: [Engineering]
tags: [Embeddedd]
---

# 嵌入式 C 语言关键词理解：从 `static` 到 `volatile`，真正影响工程稳定性的细节

最近主播想要来研究一些底层的东西，因为一些原因，暂时从学校离开，专注一段时间的开发了，未来会分享更多嵌入式/机器人领域的东西给大家。

在嵌入式开发中，我们经常会遇到一些看起来很“基础”的 C 语言关键词，例如 `static`、`volatile`、`const`、`extern`、`struct`、`enum` 等。

这些关键词如果只从语法角度理解，并不复杂；但一旦进入真实的 MCU 工程，它们就会直接影响变量存储位置、编译器优化、寄存器访问、中断通信、模块封装、RAM/Flash 占用，甚至影响系统是否稳定运行。

尤其是在 STM32、FreeRTOS、传感器采集、通信协议解析、DMA、CAN、SPI、I2C 等场景下，这些关键词会是每天都会用到的工程工具。

本文尝试从嵌入式工程视角，系统梳理这些常见关键词的含义、典型使用场景和容易踩的坑。

---

## 1. `static`：嵌入式模块封装的基础

`static` 是嵌入式开发中非常重要的关键词。它主要有三种用法：

1. 修饰局部变量
2. 修饰全局变量
3. 修饰函数

### 1.1 修饰局部变量：保留函数内部状态

普通局部变量每次进入函数都会重新创建：

```c
void func(void)
{
    int count = 0;
    count++;
}
```

每次调用 `func()`，`count` 都会重新变成 0。

如果加上 `static`：

```c
void func(void)
{
    static int count = 0;
    count++;
}
```

这个 `count` 只初始化一次，之后每次调用函数都会保留上一次的值。

它的特点是：

- 生命周期贯穿整个程序运行期间；
- 作用域仍然限制在函数内部；
- 变量通常不在栈上，而是在静态存储区。

这在嵌入式里非常适合保存局部状态，例如按键消抖、边沿检测、状态机、滤波器历史值等。

例如按键上升沿检测：

```c
void Key_Scan(void)
{
    static uint8_t last_state = 0;
    uint8_t now_state = Read_Key();

    if (now_state == 1 && last_state == 0)
    {
        // 检测到按键上升沿
    }

    last_state = now_state;
}
```

这里的 `last_state` 就不应该每次调用都重新初始化，否则永远无法记录上一次的按键状态。

---

### 1.2 修饰全局变量：限制变量只在当前 `.c` 文件内可见

例如：

```c
static uint8_t motor_state = 0;
```

这表示 `motor_state` 只能在当前 `.c` 文件中使用，其他文件不能通过 `extern` 访问它。

对比普通全局变量：

```c
uint8_t motor_state = 0;
```

这种变量可以被其他文件通过下面的方式访问：

```c
extern uint8_t motor_state;
```

但是如果变量被定义为：

```c
static uint8_t motor_state = 0;
```

它就只属于当前文件。

这在嵌入式模块化开发里非常重要。比如写一个电机模块：

```c
// motor.c

static uint8_t motor_enable = 0;
static int16_t motor_speed = 0;

void Motor_Enable(void)
{
    motor_enable = 1;
}

void Motor_SetSpeed(int16_t speed)
{
    motor_speed = speed;
}
```

外部文件只能通过 `Motor_Enable()`、`Motor_SetSpeed()` 这些接口访问电机模块，而不能直接修改 `motor_enable` 和 `motor_speed`。

这就是 C 语言里最基础的模块封装。

---

### 1.3 修饰函数：限制函数只在当前 `.c` 文件中使用

例如：

```c
static void Motor_UpdatePWM(void)
{
    // 电机内部 PWM 更新逻辑
}
```

这个函数只能在当前 `motor.c` 文件中调用，其他文件无法访问。

通常来说，`.h` 文件中声明的是对外接口：

```c
// motor.h

void Motor_Init(void);
void Motor_SetSpeed(int16_t speed);
```

而 `.c` 文件中可以包含一些内部辅助函数：

```c
// motor.c

static void Motor_UpdatePWM(void)
{
    // 内部实现细节
}
```

工程上可以这样理解：

```text
非 static 函数 = 对外 API
static 函数     = 当前模块内部函数
```

这个习惯越早养成，后期项目规模变大时越能减少混乱。

---

## 2. `volatile`：告诉编译器“这个变量可能会突然变化”

很多初学者会把 `volatile` 拼成 `violate`（比如我hahaha），但嵌入式里真正重要的是 `volatile`。

`volatile` 的核心作用是告诉编译器：

> 这个变量可能会被当前代码流程之外的因素改变，因此每次访问它时都必须真实地从内存或寄存器读取，不能擅自优化。

这里所谓“当前代码流程之外的因素”，在嵌入式里通常包括：

1. 中断服务函数；
2. 硬件寄存器；
3. DMA；
4. 多任务环境中的其他任务；
5. 外设自动修改的内存区域。

---

### 2.1 中断与主循环共享变量

假设主循环里等待一个标志位：

```c
uint8_t flag = 0;

while (flag == 0)
{
    // 等待中断修改 flag
}
```

中断里修改这个变量：

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    flag = 1;
}
```

从人的角度看，这段代码似乎没有问题。

但编译器可能会认为：

> 在这个 `while` 循环内部，`flag` 没有被修改，所以它的值可以一直认为是 0。

于是编译器可能对代码进行优化，导致主循环无法感知中断对 `flag` 的修改。

正确写法是：

```c
volatile uint8_t flag = 0;
```

这表示每次读取 `flag` 时，都必须真实读取它的当前值。

---

### 2.2 典型用法：中断标志位

```c
static volatile uint8_t timer_flag = 0;

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    timer_flag = 1;
}

void App_Task(void)
{
    if (timer_flag)
    {
        timer_flag = 0;
        Do_Something();
    }
}
```

这里 `timer_flag` 会在中断中被修改，在主循环或任务中被读取，所以需要加 `volatile`。

---

### 2.3 硬件寄存器也需要 `volatile`

硬件寄存器的值可能由外设自动改变。例如串口状态寄存器中的接收标志位，可能在收到数据后由硬件自动置位。

类似下面这种定义：

```c
#define USART1_SR (*(volatile uint32_t *)0x40011000)
```

它的意思是：

- 这个地址对应的是硬件寄存器；
- 它的值可能随时被硬件改变；
- 编译器每次访问时都必须真实读写这个地址。

STM32 的 CMSIS 里经常见到 `__IO`，它本质上通常就是 `volatile`。

```c
typedef struct
{
    __IO uint32_t CR;
    __IO uint32_t SR;
    __IO uint32_t DR;
} USART_TypeDef;
```

这里的 `__IO` 通常等价于：

```c
#define __IO volatile
```

---

### 2.4 `volatile` 不是线程安全，也不是原子操作

这是嵌入式里非常容易踩的坑。

很多人以为：

```c
volatile uint32_t count;
```

就代表 `count` 是安全的。实际上不是。

`volatile` 只能保证“每次都真实读写”，不能保证“读写过程不会被打断”。

例如：

```c
count++;
```

看起来是一句 C 代码，但底层可能包含三个步骤：

```text
1. 读取 count
2. count 加 1
3. 写回 count
```

如果主循环和中断都在修改 `count`，中间被打断，就可能造成数据错误。

更安全的做法是使用临界区：

```c
__disable_irq();
count++;
__enable_irq();
```

在 FreeRTOS 中可以使用：

```c
taskENTER_CRITICAL();
count++;
taskEXIT_CRITICAL();
```

所以要记住：

```text
volatile 解决的是编译器优化问题；
临界区、互斥锁、信号量解决的是并发访问问题。
```

---

## 3. `const`：只读数据与 Flash 资源优化

`const` 表示只读。

例如：

```c
const uint8_t table[4] = {1, 2, 3, 4};
```

这表示 `table` 不应该被程序修改。

---

### 3.1 防止函数误修改数据

例如：

```c
void OLED_ShowString(const char *str)
{
    while (*str)
    {
        OLED_ShowChar(*str++);
    }
}
```

这里的 `const char *str` 表示函数只读取字符串内容，不会修改字符串内容。

这样可以提高接口安全性。

---

### 3.2 常量表尽量放到 Flash 中

在 MCU 中，RAM 往往比 Flash 更宝贵。

例如字体表、正弦表、CRC 表、初始化命令表等，通常应该定义为：

```c
static const uint16_t sin_table[360] = {
    // ...
};
```

这里：

```text
static = 只在当前文件可见
const  = 只读，通常可以放在 Flash 中
```

这类写法在嵌入式驱动中非常常见。

---

## 4. `extern`：跨文件引用，但不要滥用

`extern` 用来声明一个变量或函数是在其他文件中定义的。

例如：

```c
// main.c
uint8_t system_ready = 0;
```

如果要在 `user.c` 中使用它：

```c
// user.c
extern uint8_t system_ready;
```

这表示：

> 这个变量不是在当前文件中定义的，它在其他地方存在，我这里只是声明一下。

但是在工程中，不建议大量使用 `extern` 暴露全局变量。

不太推荐：

```c
extern uint8_t motor_speed;
```

更推荐：

```c
Motor_SetSpeed(1000);
```

也就是说，模块内部数据尽量由模块自己管理，外部通过函数接口访问。

这样系统结构会更加清晰，也更容易维护。

---

## 5. `typedef`、`struct`、`enum`：嵌入式模块建模三件套

### 5.1 `typedef`：给类型起别名

`typedef` 用来给类型起一个新的名字。

例如我们常见的：

```c
uint8_t
uint16_t
uint32_t
int16_t
```

很多都是通过 `typedef` 定义出来的。

在嵌入式中，`typedef` 常和结构体一起使用：

```c
typedef struct
{
    uint8_t id;
    int16_t speed;
} Motor_t;
```

然后就可以直接定义变量：

```c
Motor_t motor1;
```

---

### 5.2 `struct`：把相关数据组织成一个对象

例如一个电机对象：

```c
typedef struct
{
    uint8_t id;
    int16_t target_speed;
    int16_t current_speed;
    uint8_t enable;
} Motor_t;
```

使用时：

```c
Motor_t motor_left;

motor_left.id = 1;
motor_left.target_speed = 1000;
motor_left.enable = 1;
```

结构体在嵌入式中非常适合描述：

- 电机对象；
- 舵机对象；
- 传感器对象；
- 通信协议包；
- 系统状态；
- 控制器参数。

例如一个关节传感器：

```c
typedef struct
{
    float angle;
    float velocity;
    uint8_t online;
} JointSensor_t;
```

---

### 5.3 `enum`：定义状态和模式

`enum` 用来定义一组有限状态。

例如电机状态：

```c
typedef enum
{
    MOTOR_STOP = 0,
    MOTOR_RUN,
    MOTOR_ERROR
} MotorState_t;
```

使用：

```c
MotorState_t state = MOTOR_STOP;

if (state == MOTOR_ERROR)
{
    // 处理错误
}
```

相比直接使用数字，枚举的可读性更好。

不推荐：

```c
if (state == 2)
{
    // 这个 2 到底代表什么？
}
```

推荐：

```c
if (state == MOTOR_ERROR)
{
    // 一眼能看懂
}
```

在状态机中，`enum` 非常常用：

```c
typedef enum
{
    SYS_INIT = 0,
    SYS_IDLE,
    SYS_RUNNING,
    SYS_FAULT
} SystemState_t;
```

---

## 6. `union`：协议解析和数据转换中的工具

`union` 是联合体，它的多个成员共用同一块内存。

例如：

```c
typedef union
{
    uint32_t value;
    uint8_t bytes[4];
} Data32_t;
```

使用：

```c
Data32_t data;

data.value = 0x12345678;
```

此时可以通过：

```c
data.bytes[0]
data.bytes[1]
data.bytes[2]
data.bytes[3]
```

访问这个 32 位数据的每个字节。

在串口、CAN、SPI 协议解析中，`union` 有时很方便。

但是需要注意大小端问题。STM32 常见为小端模式，因此：

```c
data.value = 0x12345678;
```

内存中的排列通常是：

```text
78 56 34 12
```

如果协议规定的是大端格式，就需要额外转换。

---

## 7. `#define` 与条件编译

`#define` 是预处理宏，在编译前进行文本替换。

例如：

```c
#define MOTOR_MAX_SPEED 3000
```

使用：

```c
if (speed > MOTOR_MAX_SPEED)
{
    speed = MOTOR_MAX_SPEED;
}
```

也可以定义简单操作：

```c
#define LED_ON()  HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET)
#define LED_OFF() HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_SET)
```

---

### 7.1 宏的常见坑

错误写法：

```c
#define SQUARE(x) x * x
```

调用：

```c
SQUARE(1 + 2)
```

预处理后会变成：

```c
1 + 2 * 1 + 2
```

结果是 5，而不是 9。

正确写法：

```c
#define SQUARE(x) ((x) * (x))
```

所以宏要特别注意括号。

对于较复杂的逻辑，更推荐使用 `static inline` 函数，而不是宏。

---

### 7.2 条件编译

```c
#define USE_DEBUG 1

#if USE_DEBUG
printf("debug message\r\n");
#endif
```

如果 `USE_DEBUG` 为 1，这段代码会参与编译；如果为 0，则不会参与编译。

常见用途包括：

- 打开或关闭调试日志；
- 区分不同硬件版本；
- 区分不同传感器配置；
- 区分裸机工程和 RTOS 工程。

---

## 8. `inline`：小函数的轻量封装

`inline` 表示建议编译器将函数展开，减少函数调用开销。

例如：

```c
static inline void LED_On(void)
{
    HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET);
}
```

对于非常短小、调用频繁的函数，`inline` 可以减少函数调用的开销。

在嵌入式里，常见组合是：

```c
static inline
```

例如：

```c
static inline uint8_t Read_Pin(void)
{
    return HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0);
}
```

这里：

```text
static = 当前文件内部使用
inline = 尽量展开，减少调用开销
```

---

## 9. `weak`：STM32 HAL 回调函数背后的机制

在 STM32 HAL 库中，经常能看到类似这样的函数：

```c
__weak void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
}
```

`weak` 表示弱定义。

可以这样理解：

> 如果用户没有自己实现这个函数，就使用这个默认版本；如果用户自己实现了同名函数，就使用用户自己的版本。

例如 HAL 库里提供了一个空的弱函数：

```c
__weak void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
}
```

用户可以在自己的代码里重新实现：

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if (GPIO_Pin == GPIO_PIN_0)
    {
        key_flag = 1;
    }
}
```

链接时，用户自己的强定义会覆盖 HAL 中的弱定义。

这就是为什么很多 STM32 回调函数可以直接重写。

---

## 10. `packed` 与 `aligned`：结构体对齐和 DMA 中的重要细节

### 10.1 `packed`：取消结构体自动对齐

例如：

```c
typedef struct
{
    uint8_t  id;
    uint32_t value;
} Packet_t;
```

从直觉上看，这个结构体大小是：

```text
1 + 4 = 5 字节
```

但由于编译器会进行内存对齐，它的实际大小可能是 8 字节。

如果用于通信协议，这可能导致发送出去的数据和协议定义不一致。

可以使用：

```c
typedef struct __attribute__((packed))
{
    uint8_t  id;
    uint32_t value;
} Packet_t;
```

这样结构体会紧凑排列，大小变成 5 字节。

不过要注意，某些 MCU 对非对齐访问并不友好，可能导致访问效率下降，甚至出现硬件异常。

---

### 10.2 `aligned`：指定数据对齐方式

例如：

```c
uint8_t dma_buffer[128] __attribute__((aligned(4)));
```

表示这个数组的地址按照 4 字节对齐。

在 DMA、Cache、USB、以太网、SDIO 等场景中，对齐非常重要。

尤其是 STM32H7 这类带 DCache 的芯片，如果 DMA buffer 没有正确对齐，并且没有处理 Cache 一致性，可能会出现非常隐蔽的数据错误。

---

## 11. `sizeof`：看似简单，但数组退化很容易出错

`sizeof` 用来获取变量或类型占用的字节数。

例如：

```c
uint32_t a;

sizeof(a);          // 通常是 4
sizeof(uint32_t);   // 通常是 4
```

在发送数组时经常使用：

```c
uint8_t buffer[64];

HAL_UART_Transmit(&huart1, buffer, sizeof(buffer), 100);
```

这里 `sizeof(buffer)` 是 64。

但如果数组作为函数参数传入：

```c
void Send(uint8_t buf[])
{
    sizeof(buf);
}
```

此时 `buf` 已经退化为指针，`sizeof(buf)` 得到的是指针大小，而不是数组长度。

所以更推荐这样写：

```c
void Send(uint8_t *buf, uint16_t len)
{
    HAL_UART_Transmit(&huart1, buf, len, 100);
}
```

调用时：

```c
uint8_t buffer[64];
Send(buffer, sizeof(buffer));
```

---

## 12. 常见组合写法

### 12.1 `static volatile`

```c
static volatile uint8_t uart_rx_done = 0;
```

含义：

```text
static   = 只在当前文件可见
volatile = 可能被中断、DMA 或硬件修改
```

典型场景：当前模块内部的中断标志位。

---

### 12.2 `static const`

```c
static const uint8_t init_cmd[] = {
    0x01, 0x02, 0x03
};
```

含义：

```text
static = 只在当前文件可见
const  = 只读，通常放在 Flash 中
```

典型场景：初始化命令表、查表数组、协议固定字段。

---

### 12.3 `static inline`

```c
static inline void LED_Toggle(void)
{
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
}
```

含义：

```text
static = 当前文件内部使用
inline = 小函数尽量展开
```

典型场景：GPIO 操作、寄存器位操作、小工具函数。

---

### 12.4 `volatile const`

```c
volatile const uint32_t status_reg;
```

含义：

```text
volatile = 这个值可能被硬件改变
const    = 软件不应该修改它
```

典型场景：只读硬件状态寄存器。

---

## 13. 一个综合示例：UART 接收模块

下面是一个简化版 UART 接收模块，可以看到多个关键词的组合使用。

```c
// uart_user.c

#include "uart_user.h"

static volatile uint8_t rx_done = 0;
static uint8_t rx_buffer[64];

static const uint8_t start_cmd[] = {0xAA, 0x55, 0x01};

static void Parse_Packet(uint8_t *buf, uint16_t len)
{
    // 内部解析函数
}

void UART_User_Init(void)
{
    HAL_UART_Receive_IT(&huart1, rx_buffer, sizeof(rx_buffer));
}

void UART_User_Task(void)
{
    if (rx_done)
    {
        rx_done = 0;
        Parse_Packet(rx_buffer, sizeof(rx_buffer));
        HAL_UART_Receive_IT(&huart1, rx_buffer, sizeof(rx_buffer));
    }
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart == &huart1)
    {
        rx_done = 1;
    }
}
```

这里面：

```c
static volatile uint8_t rx_done
```

表示这是当前文件内部使用的接收完成标志，并且它会被中断修改。

```c
static uint8_t rx_buffer[64]
```

表示这是当前模块内部的接收缓冲区。

```c
static const uint8_t start_cmd[]
```

表示这是只读的命令表，并且只在当前文件中使用。

```c
static void Parse_Packet(...)
```

表示这是模块内部解析函数，不对外暴露。

```c
sizeof(rx_buffer)
```

表示自动获取缓冲区大小。

这个例子虽然简单，但已经体现了嵌入式 C 模块封装的基本风格。

---

## 14. 工程使用建议

### 14.1 模块内部变量尽量使用 `static`

例如：

```c
static uint8_t sensor_online = 0;
static float joint_angle[21];
```

不要轻易把变量暴露成全局变量。

---

### 14.2 中断和主循环共享变量要考虑 `volatile`

例如：

```c
static volatile uint8_t rx_done = 0;
static volatile uint32_t tick_count = 0;
```

但如果涉及多字节变量或复合操作，还要配合临界区。

---

### 14.3 查表数据尽量使用 `static const`

例如：

```c
static const uint16_t crc_table[256] = {
    // ...
};
```

这样可以减少 RAM 占用，也可以避免数据被误修改。

---

### 14.4 `.h` 文件放接口，`.c` 文件放实现

推荐结构：

```c
// motor.h

void Motor_Init(void);
void Motor_SetSpeed(int16_t speed);
```

```c
// motor.c

static uint8_t motor_enable = 0;

static void Motor_UpdatePWM(void)
{
    // 内部实现
}

void Motor_Init(void)
{
    // 初始化
}

void Motor_SetSpeed(int16_t speed)
{
    // 设置速度
}
```

这样工程结构会更清晰，也更接近真实产品项目的组织方式。

---

## 15. 总结

嵌入式 C 语言中的关键词，并不是单纯为了通过语法考试而存在的。它们真正的价值，是帮助我们控制系统资源、描述硬件行为、约束模块边界，并避免编译器优化带来的隐藏问题。

可以简单总结为：

| 关键词     | 核心作用                  | 嵌入式典型用途                   |
| ---------- | ------------------------- | -------------------------------- |
| `static`   | 限制作用域 / 保持生命周期 | 模块私有变量、内部函数、状态保持 |
| `volatile` | 防止编译器错误优化        | 中断变量、硬件寄存器、DMA 标志   |
| `const`    | 只读                      | 参数保护、查表数据放 Flash       |
| `extern`   | 引用外部定义              | 跨文件访问变量或函数             |
| `inline`   | 建议函数展开              | 小函数、寄存器操作、GPIO 操作    |
| `typedef`  | 类型别名                  | 定义结构体类型、状态类型         |
| `struct`   | 组合多个变量              | 驱动对象、协议包、系统状态       |
| `enum`     | 定义有限状态              | 状态机、错误码、模式选择         |
| `union`    | 共用内存                  | 数据转换、协议解析               |
| `#define`  | 编译前替换                | 宏常量、寄存器地址、开关配置     |
| `#ifdef`   | 条件编译                  | 调试开关、平台适配               |
| `weak`     | 弱定义                    | HAL 回调函数                     |
| `packed`   | 取消结构体对齐            | 通信协议、存储格式               |
| `aligned`  | 指定对齐                  | DMA、Cache、USB、以太网          |

对于刚进入嵌入式开发的人来说，最应该优先掌握的是：

```text
static
volatile
const
extern
struct
enum
typedef
```

其中最容易引发工程问题的是：

```text
volatile 的误用
extern 全局变量滥用
const 指针混淆
sizeof 数组退化
结构体对齐问题
```

如果能真正理解这些关键词背后的工程含义，再去阅读 STM32 HAL、CMSIS、FreeRTOS 或各种驱动源码时，就会明显轻松很多。

嵌入式开发的很多能力，并不是从“会写一段代码”开始的，而是从“知道这段代码在内存里、编译器里、硬件里到底发生了什么”开始的。
