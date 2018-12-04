# Manuel d'instructions

Bienvenue dans le manuel du projet de TP4 du cours d'Architecture logicielle et conception avanc�e.

Le manuel est divis� en quatres parties : l'API REST, le client, la base de donn�e et le service Spark.

## le serveur REST API
### d�tail des choix d'architecture et de conception et des raisons derri�res ceux-ci
le serveur est un REST API pure �cris avec la technologie Node. 

Node � �t� choisis plut�t que Java pour deux raisons principales. 
Premi�rement, il s'agit d'une technologie flexible permettant de cr�er rapidement des serveur HTTP grace a sa librairie express et a son langage flexible. Node � l'avantage de n�cessit� moins de classe et de fichier que Java. De plus, avec Node, la gestion des requ�te HTTP suit un mod�le asynchrone plut�t qu'une gestion de session par Thread, ce qui �vite tous les probl�mes de concurence et bug du a des condition de course (race-condition).
En second lieu, Node � �t� choisis car il s'agissait de la technologie �tant la mieux connu des d�vellopeurs du projet. Il est plus facile et fiable pour les d�vellopeurs de travailler avec les technologies qu'ils connaissent le mieux.

Ce serveur suit la convention REST et le principe du HATEOAS (Hypermedia as the Engine of Application State). Produire un "true REST API" n'�tait pas un requis du projet. 
Nous concid�rons que les principes REST, lorsque tous correctement respecter, apporte des avantages de maintenabilit� et de fiabilit� et de r�utilisabilit�. Il est possible avec ces principes de cr�er un client agnostique au mod�les de donn�e de l'API et de la base de donn�e, ne r�agissant uniquement au r�ponse des requ�tes qui lui sont transmise � partir de la requ�te initial. Cela permet entre autre d'�tendre et de modifier le mod�le de l'API sans avoir a modifier le client. Le projet �tait une bonne occasion par sa taille et sa simplicit� de mettre en pratique la th�orie derri�re les Api REST complet.

� ce sujet, un d�fi notable � �t� de g�rer les requ�tes demandant des calculs de Spark de mani�re purement REST. pour se faire, le REST Api suit une strat�gie de cr�ation de ressource temporaire. Faire une requ�te demandant de long calcul impliquera donc de faire un "POST" pour cr�er une requ�te de calcul. Ce message renverra un lien vers une ressource pour conna�tre l'�tat de la requ�te. Lorsque la requ�te a fini d'�tre trait�, cette route envoie en plus la route ou les r�sultat des calculs peuvent �tre acc�d�.
Le REST API garde pendant une dur�e limit� le r�sultat des calculs fait a partir de tel requ�te. De plus, un nombre maximum de requ�te longue peut �tre ex�cut� en parall�le.
cette structure permet de garder les contraintes REST et d'ex�cuter des t�ches complexes et potentiellement longue sans bloquer le client et le serveur.

Ce projet de REST API n'est pas complet, en ce sens qu'il y a beaucoup d'am�liorations qui pourrait y �tre faite, mais qui d�passerais largement le cadre initial du travail pratique. En particulier, l'api ne renvois pas suffisament de meta-donn� sur la structure des donn�e envoy� et attendu dans les requ�tes. Il serait int�ressant de rajouter dans les hypermedias des d�tails sur la forme du corps des requ�tes attendus, de sorte que le client puisse trait� ses informations et demand� de mani�re plus pr�cides les donn�es � envoy� selon l'�tat de l'application.
De plus, il aurait �t� int�ressant de permettre l'envois et la r�ception de donn�e de l'API sous plusieurs formes plut�t que seulement le JSON. Les donn�es pourrait �tre envoy� en XML ou en HTML (pour �tre pr�senter visuellement directement). Aussi, cette api n'a aucune gestion de concurence entre les clients. Il n'a pas de support pour la m�thode PATCH. cette derni�re fonctionnalit� aurait �t� particuli�rement utile, mais aurait n�cessit� un langage permettant de sp�cifier les modifications au donn�e sous forme d'op�ration. Finalement, Le syst�me de modification utilise la m�thode "PUT", mais ne permet pas, contrairement � la sp�cification original de la m�thodes HTTP, d'ins�rer des ressources � l'adresse indiqu� si ces �l�ments n'ont pas �t� cr�er gr�ce � la m�thode POST auparavant.

### Mod�le de donn�e et impl�mentation

Un des d�fauts actuel des API REST est l'absence de standardisations des requ�tes et des r�ponses. Ainsi, une structure � du �tre �tablie dans les requ�tes et les r�ponses de l'API afin de permettre la cr�ation du client.

- Toutes les informations en requ�te et en r�ponses sont attendu et envoy� en JSON.
- Les r�ponses de l'API ont deux attributs principaux et commun : "result" contient les donn�es directement lier � la requ�te, et "__hypermedia" contient l'information sur la liste de route pouvant �tre acc�d� suite � cette requ�te, permettant de modifier l'�tat de l'application.

- Le mod�le des factures, le sujet de l'API, est envoy� et attendu sous la forme suivante :
{
    id : number,
    produits : [{
        nom : string,
        prix : number
    }]
}
lors d'une requ�te pour ajout� ou modifier une facture, c'est donc sous cette formes que doit �tre �cris le JSON a envoy�


### Mise en place du REST API.
1. Installer node en suivant les instructions sur le site https://nodejs.org/en/
    la version 8 ou 10 est n�cessaire.
2. Dans le dossier "api" du projet, ouvrir un terminal.
3. Dans le terminal, utiliser la commande "npm install" pour installer les d�pendences
4. pour le fonctionnement du programme, la variable environnement "CASSANDRA_IP" doit contenir l'adresse ip de la BD cassandra (les d�tails de sa mise en place sont indiqu� plus bas).
    4.1 Il est possible de configurer les variables environnement sur linux en d�marrant le programme de la sorte "CASSANDRA_IP=X.X.X.X node bin/www"
    4.2 Dans un environnement window, il est possible d'�crire "set CASSANDRA_IP=X.X.X.X" avant de lancer le programme.
    4.3 Alternativement, il est possible d'inscrire la valeur de la variable d'environnement dans le fichier ".env", qui sera lu au d�marrage du programme. les valeurs assigner directement au variable d'environnement ont priorit� sur celle �crite dans le fichier ".env"
5. Dans le terminal, utiliser la commande "node bin/www" pour d�marer le serveur contenant le REST API


## Le client.

### choix d'architecture et de conception du clients
Le client a �t� un d�fi int�ressant � concevoir pour ce projet. l'API suivant le principe HATEOAS, il n'�tait pas n�cessaire pour le client d'enregistrer l'�tat de l'application ou de la logique propre au facture et � leur cr�ation.
Le client est un utilitaire en ligne de commande int�ractif permettant d'explorer n'importe quel REST API a condition qu'ils suivent la structure des requ�tes et des r�ponses de l'API. 

voici quelque point � not� sur le client :
- Le client est agnostique au contexte du REST API et utilise uniquement les informations contenus dans les hypermedias pour permettre l'exploration de l'API et la pr�sentation des prochains choix.
- Lorsque le client demande des donn�es pour envoy� au serveur (dans le cadre d'une requ�te aillant la m�thode POST ou PUT, g�n�ralement), il s'attend � des donn�es sous forme de JSON uniquement.
- Il est un probl�me connu que certain terminaux ont des probl�mes d'encodages emp�chant l'�criture correct de certain charact�res accentu�s.

### Mise en place du client.

1. Le client est un programme en ligne de commande �cris en node. pour l'utiliser, il faut donc avoir Node 8 ou Node 10 installer. le site https://nodejs.org/en/ permet de t�l�charg� un installeur int�ractif pour le syst�me d'exploitation d�sir�.
2. Dans le dossier "client" du projet, ouvrir un terminal.
3. Dans le terminal, utiliser la commande "npm install" pour installer les d�pendences.
4. Dans le terminal, utiliser la commande "node main.js --uri X.X.X.X:3000" pour d�marrer le client. "X.X.X.X" repr�sente l'adresse IPv4 du serveur contenant le REST API. Si ce dernier est sur la m�me machine que le client, ce sera donc localhost:3000.

� partir de l�, un programme interactif en ligne de commande commencera permettant d'int�ragir avec le REST API.


## Base de donn�e cassandra

La base de donn�e choisis est celle propos� par le projet initial : Cassandra.
cette base de donn�e utilise un langage nomm� CQL pour faire des requ�tes. L'�quipe n'avais pas de connaissance pr�alable au projet sur cette base de donn�e sp�cifique, mais celle-ci est suffisament simple et bien document� pour pouvoir �tre mise en place sans difficult� excesive.

dans le cadre du projet, Cassandra ne contient qu'une seul table "factures", qui elle m�me a deux colonnes : id, un nombre (32 bit sign�) utilis� comme cl� primaire, et produits, une liste de tuple sous la forme (nom de l'article, prix).

ce mod�le � �t� choisis pour sa simplict� et son impl�mentation rapide m�me en aillant une connaissance que supperficielle de la base de donn�e et de ses capacit�s.

Cela dit, il aurait pu �tre utile de cr�er une table de produit contenant le nom, l'id et le prix de tous les produits, et que la colonne produits de la table facture


### Mise en place de la base de donn�e

Cr�er une machine virtuelle avec une image ubuntu 16.04

Installation de Cassandra:
	Pour pouvoir installer Cassandra, il faut installer java. Vous pouvez le faire avec les �tapes suivantes:
		1- sudo add-apt-repository ppa:webupd8team/java
		2- sudo apt-get update
		3- sudo apt-get install oracle-java8-set-default
		4- java -version (pas n�cessaire, juste pour v�rifier que vous avez installer java)

	Par des probl�mes d'avertissement, il est n�cessaire ajouter trois cl�s afin que cassandra marche parfaitement:
		Pour commencer, vous pouvez chercher les repos suivantes afin d'avoir acc�s aux cl�s
			1- echo "deb http://www.apache.org/dist/cassandra/debian 22x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
			2- echo "deb-src http://www.apache.org/dist/cassandra/debian 22x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
	
		Voici les commandes � executer pour installer les cl�s:
			1- gpg --keyserver pgp.mit.edu --recv-keys F758CE318D77295D
			2- gpg --export --armor F758CE318D77295D | sudo apt-key add -
			3- gpg --keyserver pgp.mit.edu --recv-keys 2B5C1B00
			4- gpg --export --armor 2B5C1B00 | sudo apt-key add -
			5- gpg --keyserver pgp.mit.edu --recv-keys 0353B12C
			6- gpg --export --armor 0353B12C | sudo apt-key add -

	Apr�s d'avoir les cl�s, updater les packages:
		1- sudo apt-get update

	Enfin, installez Cassandra:
		1- sudo apt-get install cassandra

Configuration de Cassandra:
	Pour rouler un noeud cassandra pavec l'addresse ip de la machine virtuelle, suivez les �tapes suivantes:
		 1- Aller sur le terminal et allez � /etc/cassandra
		 2- Modifier le fichier cassandra.yaml avec sudo (sudo vim cassandra.yaml) et changez les param�tres suivants:
			*seed_provider:
				(...)
				parameters:
					-seeds: "127.0.0.1,<adresse ip de la vm>"
			
			*listen_address: <addresse ip de la vm>

			*start_rpc: true
			et commentez les parametres rpc_address et broadcast_rpc_address

Ouvrir Cassandra
	Pour commencer Cassandra, executer cette commande sur le terminale:
		- sudo service cassandra start
	
	Il est possible de verifier que le service est bien ouvert avec cette commande:
		- sudo nodetool status

	Pour acceder au noeud, executer cette commande:
		- cqlsh <addresse-ip de la vm>
	
	A partir de cette commande, vous pouvez faire toutes les requetes de cassandra directement sur ce noeud. Vous pouvez
quittez en tout temps avec la commande "exit"

	Pour fermer Cassandra, executer cette commande:
		- sudo service cassandra stop	

## Spark

Installation et ajout de master � Spark
	1. Aller sur le site spark.org
	2. T�l�charger spark-2.1.0-bin-hadoop2.4
	3. Apr�s avoir install� Spark, aller dans le dossier "conf" du r�pertoire Spark
	4. Ouvrir un terminal et ex�cuter la commande "vi spark_env.sh"
	5. Ajouter les 4 lignes de codes suivant:
		SPARK_MASTER_HOST=127.0.0.1
		SPARK_LOCAL_IP=127.0.0.1
		SPARK_WORKER_INSTANCES=2
		SPARK_WORKER_CORES=1
	6. Sauvegarder le fichier et quitter
	7. Aller dans le dossier "sbin"
	8. Ensuite, ex�cuter la commande "./start-master.sh"
		Nous pouvons alors trouver notre master sur le port 8080, donc on peut tout simplement y avoir acc�s en entrant "localhost:8080"

Ajout des workers
	1. Copier le URL du master
	2. Ex�cuter la ligne suivante "./start-slave.sh " et ensuite coller le URL master que vous avez copi� (par exemple: ./start-slave.sh spark://127.0.0.1:7077)
		Vous pouvez maintenant rafra�chir la page web du master et vous pouvez maintenant voir que les 2 workers sont pr�sents

...
