# A General Embedded Workflow with VS Code and CMake

> The complete example project and configuration files used in this article are open source. Project source address:  
> https://github.com/Lee6wang/VSCODE_CMAKE_STM32F103RCT6

## Chapter 0: Preface, Why You Need to Read This Document

If you are an embedded engineer, you have probably experienced one of these situations:

- You just became familiar with STM32 + CubeIDE, and the project asks you to switch to TI.
- You just adapted to CCS, and your advisor says "this chip has a better cost-performance ratio".
- Every project uses a different IDE, and your desktop looks like a chip-vendor exhibition.
- You send the project files to a colleague, and the other person says: "Why can't I open this?"

Then you gradually realize one fact:

> **You are not only writing code. You are adapting to IDEs.**

This document is written for people who **want to find a more general solution**.

## Chapter 1: What Problem Are We Actually Solving?

Before discussing tools, configuration, and commands, first do something that looks less technical but is very important:

**clarify who we are really fighting against.**

The answer is rarely "the chip is too hard". More often, it is the following practical engineering problems.

### 1.1 Three Traditional Virtues of Vendor IDEs

First, make one thing clear:

**Vendor IDEs are not bad.**

They are simply designed from a position that is not fully aligned with your long-term engineering goals.

From an engineering perspective, most vendor IDEs have the following three "traditional virtues".

#### 1. All-In-One Package

Vendor IDEs usually prepare everything for you:

- Compiler
- Build system
- Debugger
- Download tool
- Project template

You only need to do one thing:

**click "New Project".**

This is very friendly in the early stage of a project. It can even feel like a blessing.

#### 2. Strongly Bound Project Model

But the problem starts here.

A vendor IDE often means:

- The project structure is defined by the IDE.
- The build logic is hidden in GUI settings, XML, or private files.
- Once separated from the IDE, the project becomes hard to read.

You may encounter this kind of situation:

> "I can use this project, but I do not know how it is built."

When the project grows, this gradually becomes a hidden risk.

#### 3. Usable, but Hard to Migrate

When you want to:

- Upgrade the IDE
- Change the chip
- Hand the project to another person
- Copy it to another computer

you will find that **the project and the IDE are already deeply bound together**.

Many times, "migrating the project" actually means:

> **Create a new project in the new IDE and then paste the source code into it.**

### 1.2 A Very Common Project Life Cycle That Is Rarely Faced Directly

A large number of embedded projects unconsciously follow this path:

1. **Early project stage**

   > "Use the vendor IDE first. Getting it running quickly is most important."

2. **Middle project stage**

   > "The project is getting a bit complicated, but we can still tolerate it."

3. **Late project stage**

   > "Do not touch this project. Whoever changes it may break it."

This is not because engineers do not want to optimize. It is because:

> **The project was locked into the thinking model of a specific tool from the beginning.**

### 1.3 A General Workflow Does Not Mean Rejecting Vendor IDEs

This point must be made very clear:

> **General workflow does not mean abandoning vendor IDEs.**

This is not a revolution and not a confrontation.

The real goal is a restrained change:

- Move the vendor IDE away from being the "engineering center".
- Turn it into an "optional tool".

In other words:

> **The IDE is a toolbox, not the project itself.**

You can use it for debugging, verification, and reading documentation, but it does not have to determine your project structure and life cycle.

### 1.4 What Do We Really Want?

Summarizing the core demand of this chapter, we want an engineering method that makes:

- Changing chips not equal to changing all project logic.
- Changing IDEs not equal to rebuilding the project.
- The project structure clear and readable.
- The original design still understandable years later.

This is the problem that an **embedded general workflow** tries to solve.

## Chapter 2: Configure the Basic Tools

### 2.1 Toolchain Selection

In this `VS Code + CMake` embedded general workflow, the selected toolchain follows one simple principle: prioritize tools that can exist independently from an IDE and can be called directly from the command line.

The build system uses CMake to describe the project structure and compilation method uniformly. The build executor uses `Ninja` to obtain a clean and efficient build experience. The compiler depends on the platform: `arm-none-eabi-gcc` for STM32/ARM and `cl2000` for TI C2000. This ensures the toolchain itself does not depend on any vendor IDE.

For flashing and debugging, independent tools such as OpenOCD or TI UniFlash are used. This makes downloading and debugging replaceable engineering actions instead of exclusive IDE capabilities.

With this choice, build, flash, and debug flows can remain consistent in VS Code, command line, and automated environments, avoiding the project being bound to one specific development environment.

### 2.2 Software Tool Installation

First, install the following tools:

- **VS Code:** A lightweight editor from Microsoft with a rich extension ecosystem.
- **CMake:** A cross-platform build-system generator used to manage the project build process.
- **Ninja:** A small and efficient build system that works well with CMake.
- **Compiler:**
  - For ARM platforms, install the `arm-none-eabi-gcc` toolchain.
  - For TI C2000 platforms, install TI's `cl2000` compiler.
- **Debug tools:**
  - For ARM platforms, install OpenOCD.
  - For TI C2000 platforms, install TI UniFlash.
- **MinGW or WSL**, optional for Windows users, to provide a Unix-like environment and convenient command-line tools.

The installation details are not repeated here because there are many tutorials online. One reference link is:

- [Build an embedded development environment with VSCode and CMake](https://www.freesion.com/article/29622627308/)

### 2.3 Test Whether the Software Was Installed Successfully

After installation, use the command line to test whether each tool is installed correctly:

```bash
# Test VS Code
code --version
# Test CMake
cmake --version
# Test Ninja
ninja --version
# Test ARM compiler
arm-none-eabi-gcc --version
# Test TI compiler
cl2000 --version
# Test OpenOCD
openocd --version
# Test TI UniFlash
uniflash --version
```

If all commands output version information correctly, the tools are installed successfully and you can continue to the next step.

### 2.4 Install VS Code Extensions

To better support CMake and embedded development, install these VS Code extensions:

- **CMake Tools:** Provides build and debug support for CMake projects.
- **C/C++:** Microsoft's official C/C++ extension, providing completion, debugging, and related features.
- **Cortex-Debug:** A debug extension for ARM Cortex-M processors, supporting multiple debuggers.
- **clangd:** A C/C++ language server based on LLVM, providing smart completion and navigation.

## Chapter 3: Create the First CMake Embedded Project

### 3.1 Create the Project Directory Structure

For beginners, a practical approach is to imitate the structure generated by CubeMX. In this example, CubeMX is used to generate a basic CMake project for the STM32F103RCT6 chip. After generation, the directory structure looks like this:

![Project structure](/assets/figure/2025-12-19/1.png)

The directory can be briefly explained as follows:

```text
project/
|-- CMakeLists.txt            # Project entry, describes what the project is
|-- CMakePresets.json         # Build presets, such as Debug, Release, or different toolchains
|
|-- cmake/                    # Auxiliary CMake modules
|   `-- toolchains/           # Cross-compilation toolchain definitions, such as arm-gcc or ti-c2000
|
|-- Core/                     # Core application code generated by CubeMX
|   |-- Inc/                  # Application and system header files
|   `-- Src/                  # main.c, system initialization, interrupt callbacks, and so on
|
|-- Drivers/                  # Low-level drivers provided by the chip vendor
|   |-- CMSIS/                # ARM CMSIS core and device definitions
|   `-- STM32F1xx_HAL_Driver/ # STM32 HAL driver implementation
|
|-- STM32F103XX_FLASH.ld      # Flash/RAM layout and vector-table location
|
|-- startup_stm32f103xe.s     # Startup file, reset vector and exception vector table
|
|-- openocd/                  # Debug and flashing configuration added manually
|   |-- interface/            # Debug probe interface configuration, such as ST-LINK
|   `-- target/               # Target chip configuration, such as STM32F103
|
|-- .vscode/                  # VS Code project operation configuration
|   |-- settings.json         # Editor and tool cooperation settings
|   |-- tasks.json            # Engineering actions such as build and flash
|   `-- launch.json           # Debug entry and F5 behavior
|
|-- build/                    # Build output directory, not committed to version control
|   |-- Debug/                # Debug build outputs, such as elf, map, and compile_commands
|   `-- Release/              # Optional Release build outputs
|
|-- Init_cmake.ioc            # CubeMX project configuration file
`-- .mxproject                # CubeMX project metadata
```

When this directory is opened, VS Code automatically recognizes it as a CMake project and loads the related configuration. Next, you can start writing a small amount of business code, such as adding simple LED blinking logic in `Core/Src/main.c`.

### 3.2 Compile the Project

In VS Code, press `Ctrl+Shift+P` to open the command palette, enter `CMake: Configure`, press Enter, and choose a suitable build preset, such as Debug.

After configuration completes, open the command palette again, enter `CMake: Build`, and press Enter to build the project. The build output will be generated under `build/Debug`.

![CMake build](/assets/figure/2025-12-19/2.png)

When the interface shown above appears, the project has been built successfully.

### 3.3 Flashing and Debugging

In a `VS Code + CMake` workflow, flashing and debugging do not depend on a vendor IDE. They are completed through **independent tools plus VS Code configuration files**. The overall idea is simple:

- **Download/debug tools exist independently.**
- **VS Code is only responsible for calling them.**
- **All configuration is kept inside the project directory.**

### 3.3.1 Flashing Configuration, Using OpenOCD as an Example

First, prepare OpenOCD configuration files in the project. In this example, they are already written:

```text
openocd/
|-- interface/
|   `-- stlink.cfg
`-- target/
    `-- stm32f1x.cfg
```

Then the flashing can be completed directly in the terminal:

```bash
openocd -f openocd/interface/stlink.cfg \
        -f openocd/target/stm32f1x.cfg \
        -c "program build/Debug/project.elf verify reset exit"
```

At this point, the terminal should print successful flashing information:

![OpenOCD flash](/assets/figure/2025-12-19/3.png)

The screenshot in the original article shows a failure because the board was not actually connected. That does not affect the configuration idea.

For convenience, this command is usually wrapped into VS Code's `tasks.json`. The `.vscode` directory in the example already provides it:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build (ninja)",
      "type": "shell",
      "command": "cmake",
      "args": ["--build", "${command:cmake.buildDirectory}"],
      "problemMatcher": ["$gcc"],
      "group": "build"
    },
    {
      "label": "flash (openocd, stm32f1)",
      "type": "shell",
      "command": "openocd",
      "args": [
        "-f", "openocd/interface/stlink.cfg",
        "-f", "openocd/target/stm32f103.cfg",
        "-c", "init",
        "-c", "reset init",
        "-c", "program ${command:cmake.launchTargetPath} verify reset exit"
      ],
      "problemMatcher": [],
      "dependsOn": ["build (ninja)"]
    }
  ]
}
```

Afterward, you only need to run the task in VS Code to complete flashing.

### 3.3.2 Debug Configuration (launch.json)

Debugging is configured through VS Code's `launch.json`. The following example is provided:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug STM32F103 (ST-LINK + OpenOCD)",
      "type": "cortex-debug",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "executable": "${command:cmake.launchTargetPath}",
      "servertype": "openocd",
      "configFiles": [
        "openocd/interface/stlink.cfg",
        "openocd/target/stm32f103.cfg"
      ],
      "runToEntryPoint": "main",
      "preLaunchTask": "flash (openocd, stm32f1)"
    }
  ]
}
```

After configuration, press `F5` to enter debug mode. It supports:

- Breakpoints
- Step execution
- Variable inspection
- Register and memory inspection

### 3.3.3 Common Engineering Habits

In real projects, these habits are usually followed:

- **Include flashing and debug configuration in version control.**
- **Do not commit the `build/` directory.**
- **Use relative paths to avoid machine-specific configuration.**
- **Use different OpenOCD target files for different chips.**

With this configuration, the project can be reused directly across different computers and developers.

### 3.3.4 Short Summary

With a simple OpenOCD + VS Code configuration, you can complete:

- Command-line flashing
- One-click debugging in VS Code
- A development experience decoupled from vendor IDEs

At this point, a complete **CMake + VS Code embedded project** already has the basic capabilities of **compiling, flashing, and debugging**.

## Chapter 4: Conclusion, a Workflow That Can Keep Growing

So far, this article has walked through a basic path:

- Use CMake to describe an embedded project.
- Use VS Code as a unified operation entry.
- Complete compiling, flashing, and debugging.
- Reduce the project's dependence on vendor IDEs as much as possible.

However, this is not a final solution or a standard answer.

It is more like a **starting point**.

### 4.1 This Workflow Is Not Perfect

In real engineering, many areas still deserve further exploration and polishing, such as:

- How to organize multi-chip and multi-toolchain projects more elegantly
- How to define boundaries among BSP, Middleware, and Application
- Differences and compatibility among various downloaders and debuggers
- Best practices for CMake in embedded scenarios, which are still evolving
- Further integration with CI, automated tests, and version management

These problems do not disappear automatically just because a tool is changed.

### 4.2 What Really Matters Is Not the Tool, but Engineering Awareness

If this article can convey only one core idea, it should be:

> **A project is not determined by the IDE, but by structure, boundaries, and maintainability.**

No matter what you eventually choose:

- VS Code or another editor
- CMake or another build system
- OpenOCD, J-Link, or vendor tools

as long as you start actively thinking about:

- Whether the project can be migrated
- Whether the build process can be reproduced
- Whether the project can be understood by others

then you are already moving in the right engineering direction.

### 4.3 For Those Who Are Still on the Road

If you have just started using this workflow and feel:

> "This seems a little troublesome."

That is normal.

Engineering complexity never disappears. It is either exposed explicitly in the early stage, or it bursts out collectively in the late stage.

Choosing a more general and controllable engineering method is essentially putting the problem into an **earlier and more manageable stage**.

### 4.4 Keep Exploring Instead of Copying an Answer

This article does not expect you to completely copy a directory structure or a configuration file.

Instead, it hopes that you keep adjusting, trimming, and evolving the method in your own project.

When one day you can:

- Switch tools freely
- Understand the responsibility of every layer of code clearly
- Stop fearing project migration and handover

then this workflow has truly become your own.

If you want, this article can also be only a beginning. It can be extended, split, or even completely overturned.

But as long as you start looking at embedded development with an **engineering mindset**, you have already taken a big step beyond only clicking IDE buttons.

Finally:

**Make it work. Make it better.**
