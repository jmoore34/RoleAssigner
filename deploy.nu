scp index.html root@192.3.27.182:/www/role-assigner
scp *.png root@192.3.27.182:/www/role-assigner
scp *.json root@192.3.27.182:/www/role-assigner
scp robots.txt root@192.3.27.182:/www/role-assigner
scp -r static root@192.3.27.182:/www/role-assigner
ssh root@192.3.27.182 'chmod -R 755 /www/role-assigner/'