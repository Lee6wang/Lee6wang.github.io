---
layout: categories
icon: fas fa-stream
order: 1
---
## STM32 Bootloader & IAP Upgrade System

**GitHub Repository:**  
[Master_BootLoader_App](https://github.com/Lee6wang/Master_BootLoader_App)

This project implements a complete **Bootloader + Application (APP)** architecture for STM32F4, enabling safe, flexible, and reliable firmware upgrades - without needing physical access or external debugging tools.

### Key Features
- Partition design: independent Bootloader and APP regions  
- In-Application Programming (IAP): receive firmware through UART or CAN  
- Integrity checks: length verification and CRC validation to prevent bricked devices  
- FreeRTOS friendly: upgrade logic integrated through tasks and Idle-Hook mechanisms  
- Reusable structure: CMake + CLion project for clean compilation and portability  

### Use Cases
- Mass-produced embedded devices requiring OTA or field upgrades  
- Motor controllers, robot control boards, agricultural machinery ECUs  
- Any STM32 project that needs a reliable firmware update system  

More write-ups and deep-dive articles for this project will be published here soon.
