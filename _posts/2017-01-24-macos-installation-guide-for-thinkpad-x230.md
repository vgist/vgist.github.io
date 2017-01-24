---
layout: post
title: "ThinkPad X230 安装黑苹果"
category: Mac
tags: [ThinkPad]
---

用 [ThinkPad X220]({% post_url 2015-11-22-os-x-el-capitan-installation-guide-for-thinkpad-x220 %}) 跟人家替换了 ThinkPad X230，也有一段时间了，耐不住骚动的心，又开始入了黑苹果的坑。

#### 一. BIOS 设置

| Item | Setting |
| ------------- | ------------ |
| Config/Network/Wake On Lan | Disabled |
| USB UEFI BIOS Support | Enabled |
| Always On USB | Disabled |
| USB 3.0 Mode | Enabled |
| Power Intel Rapid Start Technology | Disabled |
| Serial SATA Controller Mode Option | AHCI |
| Security Predesktop Authentication | Disabled |
| Security Chip | Disabled |
| Memory Protection Execution Prevention | Enabled |
| Virtualization | Disabled |
| Fingerprint Reader | Disabled |
| Anti Theft | Disabled |
| Computrace | Disabled |
| Secure Boot | Disabled |
| Startup Network Boot | PCI Lan |
| UEFI/Legacy Boot | UEFI Only |
| CSM Support | Disabled |
| Boot Mode | Quick |

<!-- more -->

#### 二. CLOVER

同样，usb安装盘的制作以及如何安装就不说了，太多的文章。Clover 相关的配置，可以直接从这里提取：[EFI for macOS Sierra on ThinkPad X230](https://pan.baidu.com/s/1o8npY8E)，解压开，将EFI 目录直接拷贝至你的 U 盘安装盘的 EFI 分区，或者拷贝至你系统盘的 EFI 分区。

其中，网卡我使用的是淘宝入的 ar9285，没办法，联想 x230 开始后，BIOS 白名单已经是念想了，除了硬刷没其他方法了。我偷懒，直接替换网卡好了。

##### EFI

我的 EFI 目录树，所有驱动都通过 dsdt 与 clover 来解决。

```
EFI
├── BOOT
└── CLOVER
    ├── ACPI
    │   └── patched
    │       ├── DSDT.aml
    │       └── SSDT.aml
    ├── CLOVERX64.efi
    ├── config.plist
    ├── drivers64UEFI
    ├── kexts
    │   └── Other
    │       ├── ACPIBatteryManager.kext
    │       ├── ACPISensors.kext
    │       ├── AppleALC.kext
    │       ├── AppleIntelE1000e.kext
    │       ├── BrcmFirmwareData.kext
    │       ├── BrcmPatchRAM2.kext
    │       ├── CPUSensors.kext
    │       ├── FakeSMC.kext
    │       ├── GPUSensors.kext
    │       ├── IntelBacklight.kext
    │       ├── LPCSensors.kext
    │       └── VoodooPS2Controller.kext
    ├── themes
    │   └── embedded
    └── tools
```

其中，AppleALC.kext 采用的是 vit9696 的驱动：<https://github.com/vit9696/AppleALC>，layoutID 为 28。

待续...
