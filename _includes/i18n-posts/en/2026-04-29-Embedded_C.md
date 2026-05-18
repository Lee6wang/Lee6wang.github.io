# Understanding Embedded C Keywords: From `static` to `volatile` and the Details That Affect Engineering Stability

Recently I want to study more low-level topics. For some reasons, I have temporarily left school and will focus on development for a while. In the future, I will share more embedded and robotics-related content.

In embedded development, we often encounter C keywords that look very "basic", such as `static`, `volatile`, `const`, `extern`, `struct`, and `enum`.

If these keywords are understood only from the syntax level, they are not complicated. But once they enter real MCU projects, they directly affect variable storage location, compiler optimization, register access, interrupt communication, module encapsulation, RAM/Flash usage, and even whether the system runs stably.

In scenarios such as STM32, FreeRTOS, sensor acquisition, communication protocol parsing, DMA, CAN, SPI, and I2C, these keywords are engineering tools used every day.

This article tries to organize the meaning, typical use cases, and common pitfalls of these keywords from an embedded engineering perspective.

---

## 1. `static`: The Foundation of Embedded Module Encapsulation

`static` is very important in embedded development. It mainly has three usages:

1. Modifying local variables
2. Modifying global variables
3. Modifying functions

### 1.1 Modifying Local Variables: Preserve State Inside a Function

An ordinary local variable is recreated every time the function is entered:

```c
void func(void)
{
    int count = 0;
    count++;
}
```

Every time `func()` is called, `count` becomes 0 again.

If `static` is added:

```c
void func(void)
{
    static int count = 0;
    count++;
}
```

This `count` is initialized only once, and each later function call preserves the previous value.

Its characteristics are:

- The lifetime runs through the whole program execution period.
- The scope is still limited inside the function.
- The variable is usually not on the stack, but in the static storage area.

This is very suitable in embedded systems for saving local state, such as key debounce, edge detection, state machines, filter history values, and so on.

Example: key rising-edge detection:

```c
void Key_Scan(void)
{
    static uint8_t last_state = 0;
    uint8_t now_state = Read_Key();

    if (now_state == 1 && last_state == 0)
    {
        // Rising edge detected
    }

    last_state = now_state;
}
```

Here `last_state` must not be reinitialized every time the function is called, otherwise it can never remember the previous key state.

---

### 1.2 Modifying Global Variables: Limit Visibility to the Current `.c` File

For example:

```c
static uint8_t motor_state = 0;
```

This means `motor_state` can only be used in the current `.c` file. Other files cannot access it through `extern`.

Compare with an ordinary global variable:

```c
uint8_t motor_state = 0;
```

This variable can be accessed by other files through:

```c
extern uint8_t motor_state;
```

But if it is defined as:

```c
static uint8_t motor_state = 0;
```

then it belongs only to the current file.

This is very important in embedded modular development. For example, when writing a motor module:

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

External files can only access the motor module through interfaces such as `Motor_Enable()` and `Motor_SetSpeed()`. They cannot directly modify `motor_enable` or `motor_speed`.

This is the most basic module encapsulation in C.

---

### 1.3 Modifying Functions: Limit a Function to the Current `.c` File

For example:

```c
static void Motor_UpdatePWM(void)
{
    // Internal PWM update logic for the motor
}
```

This function can only be called inside the current `motor.c` file. Other files cannot access it.

Usually, the `.h` file declares external interfaces:

```c
// motor.h

void Motor_Init(void);
void Motor_SetSpeed(int16_t speed);
```

The `.c` file can contain internal helper functions:

```c
// motor.c

static void Motor_UpdatePWM(void)
{
    // Internal implementation details
}
```

From an engineering perspective:

```text
non-static function = external API
static function     = internal function of the current module
```

The earlier this habit is formed, the less confusion there will be when the project grows.

---

## 2. `volatile`: Tell the Compiler "This Variable May Suddenly Change"

Many beginners spell `volatile` as `violate`, but in embedded development the important one is `volatile`.

The core role of `volatile` is to tell the compiler:

> This variable may be changed by something outside the current code flow. Therefore, every access must really read from memory or registers, and the compiler must not optimize it away by assumption.

In embedded systems, "outside the current code flow" usually includes:

1. Interrupt service routines
2. Hardware registers
3. DMA
4. Other tasks in a multitasking environment
5. Memory regions automatically modified by peripherals

---

### 2.1 Variables Shared Between Interrupt and Main Loop

Assume the main loop waits for a flag:

```c
uint8_t flag = 0;

while (flag == 0)
{
    // Wait for interrupt to modify flag
}
```

The interrupt modifies this variable:

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    flag = 1;
}
```

From a human perspective, this looks fine.

But the compiler may think:

> Inside this `while` loop, `flag` is never modified, so its value can always be considered 0.

Then the compiler may optimize the code so that the main loop can no longer sense the interrupt's modification of `flag`.

The correct writing is:

```c
volatile uint8_t flag = 0;
```

This means every read of `flag` must read its current value.

---

### 2.2 Typical Usage: Interrupt Flag

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

Here `timer_flag` is modified in an interrupt and read in the main loop or task, so it needs `volatile`.

---

### 2.3 Hardware Registers Also Need `volatile`

The value of a hardware register may be changed automatically by a peripheral. For example, the receive flag in a UART status register may be set by hardware after data is received.

A definition like this is common:

```c
#define USART1_SR (*(volatile uint32_t *)0x40011000)
```

It means:

- The address corresponds to a hardware register.
- Its value may be changed by hardware at any time.
- The compiler must really read and write this address every time it is accessed.

In STM32 CMSIS, `__IO` is often seen. It is usually essentially `volatile`:

```c
typedef struct
{
    __IO uint32_t CR;
    __IO uint32_t SR;
    __IO uint32_t DR;
} USART_TypeDef;
```

`__IO` is usually equivalent to:

```c
#define __IO volatile
```

---

### 2.4 `volatile` Is Not Thread Safety and Not Atomic Operation

This is a very common embedded pitfall.

Many people think:

```c
volatile uint32_t count;
```

means `count` is safe. It does not.

`volatile` only guarantees "read and write for real every time". It does not guarantee that the read-write process will not be interrupted.

For example:

```c
count++;
```

This looks like one C statement, but the underlying operation may include three steps:

```text
1. Read count
2. Add 1
3. Write count back
```

If both the main loop and interrupt modify `count`, and an interrupt occurs in the middle, data errors may occur.

A safer method is to use a critical section:

```c
__disable_irq();
count++;
__enable_irq();
```

In FreeRTOS:

```c
taskENTER_CRITICAL();
count++;
taskEXIT_CRITICAL();
```

Remember:

```text
volatile solves compiler optimization problems.
Critical sections, mutexes, and semaphores solve concurrent-access problems.
```

---

## 3. `const`: Read-Only Data and Flash Resource Optimization

`const` means read-only.

For example:

```c
const uint8_t table[4] = {1, 2, 3, 4};
```

This means `table` should not be modified by the program.

---

### 3.1 Prevent Functions from Accidentally Modifying Data

For example:

```c
void OLED_ShowString(const char *str)
{
    while (*str)
    {
        OLED_ShowChar(*str++);
    }
}
```

Here `const char *str` means the function only reads the string content and will not modify it.

This improves interface safety.

---

### 3.2 Put Constant Tables in Flash Whenever Possible

In MCUs, RAM is often more precious than Flash.

Font tables, sine tables, CRC tables, initialization command tables, and similar data should usually be defined as:

```c
static const uint16_t sin_table[360] = {
    // ...
};
```

Here:

```text
static = visible only in the current file
const  = read-only, usually can be placed in Flash
```

This pattern is very common in embedded drivers.

---

## 4. `extern`: Cross-File Reference, but Do Not Abuse It

`extern` declares that a variable or function is defined in another file.

For example:

```c
// main.c
uint8_t system_ready = 0;
```

If it needs to be used in `user.c`:

```c
// user.c
extern uint8_t system_ready;
```

This means:

> This variable is not defined in the current file. It exists somewhere else; I am only declaring it here.

But in engineering, it is not recommended to expose many global variables through `extern`.

Not recommended:

```c
extern uint8_t motor_speed;
```

Recommended:

```c
Motor_SetSpeed(1000);
```

That is, module internal data should be managed by the module itself, and external code should access it through function interfaces.

This makes the system structure clearer and easier to maintain.

---

## 5. `typedef`, `struct`, and `enum`: Three Tools for Embedded Module Modeling

### 5.1 `typedef`: Give a Type an Alias

`typedef` creates a new name for a type.

Common examples include:

```c
uint8_t
uint16_t
uint32_t
int16_t
```

Many of them are defined through `typedef`.

In embedded systems, `typedef` is often used together with structures:

```c
typedef struct
{
    uint8_t id;
    int16_t speed;
} Motor_t;
```

Then variables can be defined directly:

```c
Motor_t motor1;
```

---

### 5.2 `struct`: Organize Related Data into an Object

For example, a motor object:

```c
typedef struct
{
    uint8_t id;
    int16_t target_speed;
    int16_t current_speed;
    uint8_t enable;
} Motor_t;
```

Usage:

```c
Motor_t motor_left;

motor_left.id = 1;
motor_left.target_speed = 1000;
motor_left.enable = 1;
```

Structures are very suitable for describing:

- Motor objects
- Servo objects
- Sensor objects
- Communication packets
- System states
- Controller parameters

For example, a joint sensor:

```c
typedef struct
{
    float angle;
    float velocity;
    uint8_t online;
} JointSensor_t;
```

---

### 5.3 `enum`: Define States and Modes

`enum` defines a finite group of states.

For example, motor states:

```c
typedef enum
{
    MOTOR_STOP = 0,
    MOTOR_RUN,
    MOTOR_ERROR
} MotorState_t;
```

Usage:

```c
MotorState_t state = MOTOR_STOP;

if (state == MOTOR_ERROR)
{
    // Handle error
}
```

Compared with using numbers directly, enums are more readable.

Not recommended:

```c
if (state == 2)
{
    // What does 2 mean?
}
```

Recommended:

```c
if (state == MOTOR_ERROR)
{
    // Clear at a glance
}
```

In state machines, `enum` is very common:

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

## 6. `union`: A Tool for Protocol Parsing and Data Conversion

`union` means multiple members share the same memory block.

For example:

```c
typedef union
{
    uint32_t value;
    uint8_t bytes[4];
} Data32_t;
```

Usage:

```c
Data32_t data;

data.value = 0x12345678;
```

Now each byte of this 32-bit data can be accessed through:

```c
data.bytes[0]
data.bytes[1]
data.bytes[2]
data.bytes[3]
```

In UART, CAN, and SPI protocol parsing, `union` can be convenient.

However, endianness must be considered. STM32 is commonly little-endian, so:

```c
data.value = 0x12345678;
```

is usually arranged in memory as:

```text
78 56 34 12
```

If the protocol specifies big-endian format, extra conversion is required.

---

## 7. `#define` and Conditional Compilation

`#define` is a preprocessor macro that performs text replacement before compilation.

For example:

```c
#define MOTOR_MAX_SPEED 3000
```

Usage:

```c
if (speed > MOTOR_MAX_SPEED)
{
    speed = MOTOR_MAX_SPEED;
}
```

It can also define simple operations:

```c
#define LED_ON()  HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET)
#define LED_OFF() HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_SET)
```

---

### 7.1 Common Macro Pitfalls

Wrong writing:

```c
#define SQUARE(x) x * x
```

Calling:

```c
SQUARE(1 + 2)
```

After preprocessing, it becomes:

```c
1 + 2 * 1 + 2
```

The result is 5, not 9.

Correct writing:

```c
#define SQUARE(x) ((x) * (x))
```

So macros must pay special attention to parentheses.

For more complex logic, `static inline` functions are usually recommended instead of macros.

---

### 7.2 Conditional Compilation

```c
#define USE_DEBUG 1

#if USE_DEBUG
printf("debug message\r\n");
#endif
```

If `USE_DEBUG` is 1, this code participates in compilation. If it is 0, it does not.

Common uses include:

- Enable or disable debug logs
- Distinguish hardware versions
- Distinguish sensor configurations
- Distinguish bare-metal projects and RTOS projects

---

## 8. `inline`: Lightweight Encapsulation of Small Functions

`inline` suggests that the compiler expand the function to reduce function-call overhead.

For example:

```c
static inline void LED_On(void)
{
    HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET);
}
```

For very short and frequently called functions, `inline` can reduce call overhead.

In embedded systems, the common combination is:

```c
static inline
```

For example:

```c
static inline uint8_t Read_Pin(void)
{
    return HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_0);
}
```

Here:

```text
static = used only inside the current file
inline = try to expand and reduce call overhead
```

---

## 9. `weak`: The Mechanism Behind STM32 HAL Callback Functions

In the STM32 HAL library, functions like this often appear:

```c
__weak void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
}
```

`weak` means weak definition.

It can be understood this way:

> If the user does not implement this function, the default version is used. If the user implements a function with the same name, the user's version is used.

For example, HAL provides an empty weak function:

```c
__weak void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
}
```

The user can implement it again:

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if (GPIO_Pin == GPIO_PIN_0)
    {
        key_flag = 1;
    }
}
```

During linking, the user's strong definition overrides the weak definition in HAL.

This is why many STM32 callback functions can be rewritten directly.

---

## 10. `packed` and `aligned`: Important Details in Structure Alignment and DMA

### 10.1 `packed`: Disable Automatic Structure Alignment

For example:

```c
typedef struct
{
    uint8_t  id;
    uint32_t value;
} Packet_t;
```

Intuitively, the size should be:

```text
1 + 4 = 5 bytes
```

But because the compiler performs memory alignment, the actual size may be 8 bytes.

If this structure is used in a communication protocol, the sent data may not match the protocol definition.

Use:

```c
typedef struct __attribute__((packed))
{
    uint8_t  id;
    uint32_t value;
} Packet_t;
```

Then the structure is tightly packed and becomes 5 bytes.

However, note that some MCUs are not friendly to unaligned access. It may reduce access efficiency or even cause hardware exceptions.

---

### 10.2 `aligned`: Specify Data Alignment

For example:

```c
uint8_t dma_buffer[128] __attribute__((aligned(4)));
```

This means the array address is aligned to 4 bytes.

Alignment is very important in DMA, Cache, USB, Ethernet, SDIO, and similar scenarios.

Especially on chips such as STM32H7 with DCache, if the DMA buffer is not correctly aligned and cache coherence is not handled, very hidden data errors may occur.

---

## 11. `sizeof`: Simple-Looking, but Array Decay Is Easy to Get Wrong

`sizeof` obtains the number of bytes occupied by a variable or type.

For example:

```c
uint32_t a;

sizeof(a);          // Usually 4
sizeof(uint32_t);   // Usually 4
```

It is often used when sending arrays:

```c
uint8_t buffer[64];

HAL_UART_Transmit(&huart1, buffer, sizeof(buffer), 100);
```

Here `sizeof(buffer)` is 64.

But if the array is passed as a function parameter:

```c
void Send(uint8_t buf[])
{
    sizeof(buf);
}
```

At this point, `buf` has decayed into a pointer, so `sizeof(buf)` gives the pointer size, not the array length.

Therefore, the recommended writing is:

```c
void Send(uint8_t *buf, uint16_t len)
{
    HAL_UART_Transmit(&huart1, buf, len, 100);
}
```

Call it as:

```c
uint8_t buffer[64];
Send(buffer, sizeof(buffer));
```

---

## 12. Common Combination Patterns

### 12.1 `static volatile`

```c
static volatile uint8_t uart_rx_done = 0;
```

Meaning:

```text
static   = visible only in the current file
volatile = may be modified by interrupt, DMA, or hardware
```

Typical scenario: interrupt flag inside the current module.

---

### 12.2 `static const`

```c
static const uint8_t init_cmd[] = {
    0x01, 0x02, 0x03
};
```

Meaning:

```text
static = visible only in the current file
const  = read-only, usually placed in Flash
```

Typical scenario: initialization command table, lookup table, fixed protocol fields.

---

### 12.3 `static inline`

```c
static inline void LED_Toggle(void)
{
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);
}
```

Meaning:

```text
static = used inside the current file
inline = try to expand small functions
```

Typical scenario: GPIO operations, register bit operations, small utility functions.

---

### 12.4 `volatile const`

```c
volatile const uint32_t status_reg;
```

Meaning:

```text
volatile = this value may be changed by hardware
const    = software should not modify it
```

Typical scenario: read-only hardware status register.

---

## 13. A Comprehensive Example: UART Receive Module

The following is a simplified UART receive module, showing how multiple keywords are used together:

```c
// uart_user.c

#include "uart_user.h"

static volatile uint8_t rx_done = 0;
static uint8_t rx_buffer[64];

static const uint8_t start_cmd[] = {0xAA, 0x55, 0x01};

static void Parse_Packet(uint8_t *buf, uint16_t len)
{
    // Internal parsing function
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

In this example:

```c
static volatile uint8_t rx_done
```

means this receive-complete flag is used inside the current file and may be modified by an interrupt.

```c
static uint8_t rx_buffer[64]
```

means this receive buffer is internal to the current module.

```c
static const uint8_t start_cmd[]
```

means this is a read-only command table used only in the current file.

```c
static void Parse_Packet(...)
```

means this parsing function is internal to the module and not exposed externally.

```c
sizeof(rx_buffer)
```

automatically obtains the buffer size.

Although this example is simple, it already reflects the basic style of embedded C module encapsulation.

---

## 14. Engineering Usage Suggestions

### 14.1 Use `static` for Module-Internal Variables Whenever Possible

For example:

```c
static uint8_t sensor_online = 0;
static float joint_angle[21];
```

Do not expose variables as global variables casually.

---

### 14.2 Consider `volatile` for Variables Shared Between Interrupt and Main Loop

For example:

```c
static volatile uint8_t rx_done = 0;
static volatile uint32_t tick_count = 0;
```

But if multi-byte variables or compound operations are involved, critical sections are also needed.

---

### 14.3 Use `static const` for Lookup Tables Whenever Possible

For example:

```c
static const uint16_t crc_table[256] = {
    // ...
};
```

This reduces RAM usage and prevents accidental modification.

---

### 14.4 Put Interfaces in `.h` Files and Implementations in `.c` Files

Recommended structure:

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
    // Internal implementation
}

void Motor_Init(void)
{
    // Initialization
}

void Motor_SetSpeed(int16_t speed)
{
    // Set speed
}
```

This makes the project structure clearer and closer to real product projects.

---

## 15. Summary

Keywords in embedded C do not exist only for syntax exams. Their real value is helping us control system resources, describe hardware behavior, constrain module boundaries, and avoid hidden problems caused by compiler optimization.

They can be summarized as:

| Keyword | Core role | Typical embedded use |
| ------- | --------- | -------------------- |
| `static` | Limit scope / preserve lifetime | Module-private variables, internal functions, state preservation |
| `volatile` | Prevent incorrect compiler optimization | Interrupt variables, hardware registers, DMA flags |
| `const` | Read-only | Protect parameters, put lookup tables in Flash |
| `extern` | Reference external definitions | Cross-file access to variables or functions |
| `inline` | Suggest function expansion | Small functions, register operations, GPIO operations |
| `typedef` | Type alias | Define structure types and state types |
| `struct` | Combine multiple variables | Driver objects, protocol packets, system states |
| `enum` | Define finite states | State machines, error codes, mode selection |
| `union` | Shared memory | Data conversion and protocol parsing |
| `#define` | Pre-compilation replacement | Macro constants, register addresses, configuration switches |
| `#ifdef` | Conditional compilation | Debug switches and platform adaptation |
| `weak` | Weak definition | HAL callback functions |
| `packed` | Disable structure alignment | Communication protocols and storage formats |
| `aligned` | Specify alignment | DMA, Cache, USB, Ethernet |

For people just entering embedded development, the first keywords to master are:

```text
static
volatile
const
extern
struct
enum
typedef
```

The easiest problems to trigger in real projects are:

```text
Misuse of volatile
Abuse of extern global variables
Confusion around const pointers
sizeof array decay
Structure alignment issues
```

If you can truly understand the engineering meaning behind these keywords, reading STM32 HAL, CMSIS, FreeRTOS, or driver source code becomes much easier.

Many embedded-development abilities do not start from "being able to write a piece of code". They start from knowing what that code does in memory, in the compiler, and in the hardware.
