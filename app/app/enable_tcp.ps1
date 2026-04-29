Import-Module SQLPS -DisableNameChecking
$wmi = new-object ('Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer') localhost
$tcp = $wmi.ServerInstances[0].ServerProtocols['Tcp']
$tcp.IsEnabled = $true
$tcp.Alter()

$ipAll = $tcp.IPAddresses | Where-Object { $_.Name -eq "IPAll" }
$ipAll.IPAddressProperties["TcpPort"].Value = "1433"
$ipAll.IPAddressProperties["TcpDynamicPorts"].Value = ""
$tcp.Alter()

Restart-Service -Name "MSSQLSERVER" -Force
