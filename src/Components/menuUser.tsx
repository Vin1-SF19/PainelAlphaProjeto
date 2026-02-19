import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"



import {
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

export function MenuUser() {
  return (
    <div>
      <DropdownMenu >
        <DropdownMenuTrigger asChild className="cursor-pointer text-white w-30">
          <Button variant="default" className="Usuario h-10 p-5">Usuario</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>

          <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 transition-colors duration-[500ms] ease-in-out">
            <UserIcon />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 transition-colors duration-[500ms] ease-in-out">
            <SettingsIcon />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 transition-colors duration-[500ms] ease-in-out" variant="destructive">
            <LogOutIcon/>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
