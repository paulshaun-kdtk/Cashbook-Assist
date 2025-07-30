// "use client"

// import * as React from "react"
// // import { Moon, Sun } from "lucide-react"
// import { useTheme } from "@/context/ThemeContext"

// // import { Button } from "@/components/ui/button"
// import Button from "../ui/button/Button"
// import { Dropdown } from "../ui/dropdown/Dropdown"
// import { DropdownItem } from "../ui/dropdown/DropdownItem"

// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu"

// export default function ThemeToggle() {
//   const { setTheme } = useTheme()

//   return (
//     <Dropdown trigger={<Button variant="outline" size="sm" />}>
//       <DropdownItem asChild>
//         <Button variant="outline" size="icon">
//           <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//           <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//           <span className="sr-only">Toggle theme</span>
//         </Button>
//       </DropdownItem>
//       <DropdownMenuContent align="end">
//         <DropdownMenuItem onClick={() => setTheme("light")}>
//           Light
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("dark")}>
//           Dark
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme("system")}>
//           System
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </Dropdown>
//   )
// }
