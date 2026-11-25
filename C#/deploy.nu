dotnet build --runtime linux-x64 --configuration Release
scp bin\Release\net10.0\linux-x64\RoleAssigner.dll root@192.3.27.182:.
scp bin\Release\net10.0\linux-x64\RoleAssigner.runtimeconfig.json root@192.3.27.182:.